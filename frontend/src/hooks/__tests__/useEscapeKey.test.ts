import { renderHook } from "@testing-library/react";

import { useEscapeKey } from "hooks/useEscapeKey";

const pressEscape = () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
};

describe("useEscapeKey", () => {
    it("should call the handler when Escape is pressed", () => {
        const onEscape = jest.fn();

        renderHook(() => {
            useEscapeKey(onEscape);
        });

        pressEscape();

        expect(onEscape).toHaveBeenCalledTimes(1);
    });

    it("should not call the handler for other keys", () => {
        const onEscape = jest.fn();

        renderHook(() => {
            useEscapeKey(onEscape);
        });

        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

        expect(onEscape).not.toHaveBeenCalled();
    });

    it("should not listen when disabled", () => {
        const onEscape = jest.fn();

        renderHook(() => {
            useEscapeKey(onEscape, false);
        });

        pressEscape();

        expect(onEscape).not.toHaveBeenCalled();
    });

    it("should stop listening after unmount", () => {
        const onEscape = jest.fn();

        const { unmount } = renderHook(() => {
            useEscapeKey(onEscape);
        });

        unmount();
        pressEscape();

        expect(onEscape).not.toHaveBeenCalled();
    });
});
