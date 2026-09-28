import { act } from "@testing-library/react";

import { useShareLink } from "hooks/useShareLink";

import { renderHookWithStore } from "test/store";

const setClipboard = (writeText: jest.Mock) => {
    Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText },
    });
};

describe("useShareLink", () => {
    it("should copy the page address without its query and confirm it", async () => {
        const writeText = jest.fn().mockResolvedValue(undefined);

        setClipboard(writeText);
        window.history.pushState({}, "", "/recipe/7?from=search");
        const { result, store } = renderHookWithStore(() => useShareLink());

        await act(async () => {
            await result.current.share("Borscht");
        });

        expect(writeText).toHaveBeenCalledWith(
            `${window.location.origin}/recipe/7`,
        );
        expect(store.getState().notifications.items).toEqual([
            expect.objectContaining({
                type: "success",
                message: "Link copied",
            }),
        ]);
    });

    it("should say so when the link could not be copied", async () => {
        setClipboard(jest.fn().mockRejectedValue(new Error("denied")));
        const { result, store } = renderHookWithStore(() => useShareLink());

        await act(async () => {
            await result.current.share("Borscht");
        });

        expect(store.getState().notifications.items).toEqual([
            expect.objectContaining({
                type: "error",
                message: "Couldn't copy the link",
            }),
        ]);
    });
});
