import { act, renderHook } from "@testing-library/react";

import { MAX_IMAGE_BYTES } from "constants/media";

import { usePhotoDraft } from "hooks/usePhotoDraft";

import { mediaUrl } from "utils/mediaUrl";

const STORED_KEY = "0b8f5a3e-2c4d-4e6f-8a1b-3c5d7e9f1a2b";
const PHOTO = new File(["image"], "dish.png", { type: "image/png" });

const upload = jest.fn().mockResolvedValue(null);
const clear = jest.fn().mockResolvedValue(null);

const renderDraft = (initialKey: string | null = STORED_KEY) =>
    renderHook(() => usePhotoDraft(initialKey, "card"));

describe("usePhotoDraft", () => {
    it("should show the stored photo at the requested size", () => {
        const { result } = renderDraft();

        expect(result.current.src).toBe(mediaUrl(STORED_KEY, "card"));
        expect(result.current.isDirty).toBe(false);
    });

    it("should refuse a photo over the size limit", () => {
        const { result } = renderDraft();

        act(() => {
            result.current.choose(
                new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], "huge.jpg", {
                    type: "image/jpeg",
                }),
            );
        });

        expect(result.current.error).toBe(
            "This photo is too large. Choose one under 10 MB.",
        );
        expect(result.current.isDirty).toBe(false);
    });

    it("should clear the error once an acceptable photo is picked", () => {
        const { result } = renderDraft();

        act(() => {
            result.current.choose(
                new File(["gif"], "dish.gif", { type: "image/gif" }),
            );
        });
        act(() => {
            result.current.choose(PHOTO);
        });

        expect(result.current.error).toBeNull();
        expect(result.current.isDirty).toBe(true);
    });

    it("should release the previous preview when another photo is picked", () => {
        const revokeSpy = jest.spyOn(URL, "revokeObjectURL");
        const { result } = renderDraft();

        act(() => {
            result.current.choose(PHOTO);
        });
        const firstPreview = result.current.src;

        act(() => {
            result.current.choose(PHOTO);
        });

        expect(revokeSpy).toHaveBeenCalledWith(firstPreview);
    });

    it("should send nothing when the photo was left untouched", async () => {
        const { result } = renderDraft();

        await act(async () => {
            await result.current.commitWith({ upload, clear });
        });

        expect(upload).not.toHaveBeenCalled();
        expect(clear).not.toHaveBeenCalled();
    });

    it("should not count removing a photo that was never stored as a change", async () => {
        const { result } = renderDraft(null);

        act(() => {
            result.current.remove();
        });

        expect(result.current.isDirty).toBe(false);

        await act(async () => {
            await result.current.commitWith({ upload, clear });
        });

        expect(upload).not.toHaveBeenCalled();
        expect(clear).not.toHaveBeenCalled();
    });

    it("should upload the picked photo rather than clear the stored one", async () => {
        const { result } = renderDraft();

        act(() => {
            result.current.remove();
        });
        act(() => {
            result.current.choose(PHOTO);
        });
        await act(async () => {
            await result.current.commitWith({ upload, clear });
        });

        expect(upload).toHaveBeenCalledWith(PHOTO);
        expect(clear).not.toHaveBeenCalled();
    });

    it("should drop the draft when reset to a newly stored photo", () => {
        const { result } = renderDraft(null);

        act(() => {
            result.current.choose(PHOTO);
        });
        act(() => {
            result.current.reset(STORED_KEY);
        });

        expect(result.current.src).toBe(mediaUrl(STORED_KEY, "card"));
        expect(result.current.isDirty).toBe(false);
    });

    it("should release the preview when the form goes away", () => {
        const revokeSpy = jest.spyOn(URL, "revokeObjectURL");
        const { result, unmount } = renderDraft();

        act(() => {
            result.current.choose(PHOTO);
        });
        const preview = result.current.src;

        unmount();

        expect(revokeSpy).toHaveBeenCalledWith(preview);
    });
});
