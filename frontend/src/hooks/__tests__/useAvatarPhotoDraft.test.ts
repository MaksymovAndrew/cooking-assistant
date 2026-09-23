import { act } from "@testing-library/react";

import { API_ROUTES } from "api/endpoints";

import { useAvatarPhotoDraft } from "hooks/useAvatarPhotoDraft";

import { mediaUrl } from "utils/mediaUrl";

import { mockedDelete, mockedPut } from "test/apiClientMock";
import { renderHookWithStore } from "test/store";

jest.mock("api/client");

const STORED_KEY = "0b8f5a3e-2c4d-4e6f-8a1b-3c5d7e9f1a2b";
const PHOTO = new File(["image"], "me.jpg", { type: "image/jpeg" });

describe("useAvatarPhotoDraft", () => {
    it("should start from the stored avatar photo at card size", () => {
        const { result } = renderHookWithStore(() =>
            useAvatarPhotoDraft(STORED_KEY),
        );

        expect(result.current.src).toBe(mediaUrl(STORED_KEY, "card"));
    });

    it("should upload a picked photo to the avatar path when committed", async () => {
        mockedPut.mockResolvedValue({ data: { photo_key: STORED_KEY } });
        const { result } = renderHookWithStore(() => useAvatarPhotoDraft(null));

        act(() => {
            result.current.choose(PHOTO);
        });
        await act(async () => {
            await result.current.commit();
        });

        expect(mockedPut).toHaveBeenCalledWith(API_ROUTES.auth.avatar, PHOTO);
    });

    it("should delete the stored photo when it was removed", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const { result } = renderHookWithStore(() =>
            useAvatarPhotoDraft(STORED_KEY),
        );

        act(() => {
            result.current.remove();
        });
        await act(async () => {
            await result.current.commit();
        });

        expect(mockedDelete).toHaveBeenCalledWith(API_ROUTES.auth.avatar, {
            data: undefined,
            params: undefined,
        });
    });
});
