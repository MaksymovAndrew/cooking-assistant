import { renderHook } from "@testing-library/react";
import { useRef } from "react";

import { useAddressBarReflowFix } from "hooks/useAddressBarReflowFix";

const setup = (element: HTMLElement) => {
    const { unmount } = renderHook(() => {
        const hookRef = useRef(element);

        useAddressBarReflowFix(hookRef);
    });

    return { unmount };
};

describe("useAddressBarReflowFix", () => {
    it("should not throw when window.visualViewport is unavailable", () => {
        expect(() => setup(document.createElement("nav"))).not.toThrow();
    });

    it("should subscribe to the visualViewport resize event when available", () => {
        const addEventListener = jest.fn();
        const removeEventListener = jest.fn();

        // a minimal stub - jsdom has no real VisualViewport implementation to test against
        window.visualViewport = {
            addEventListener,
            removeEventListener,
        } as unknown as VisualViewport;

        const { unmount } = setup(document.createElement("nav"));

        expect(addEventListener).toHaveBeenCalledWith(
            "resize",
            expect.any(Function),
        );

        unmount();

        expect(removeEventListener).toHaveBeenCalledWith(
            "resize",
            expect.any(Function),
        );

        // @ts-expect-error - cleaning up the test-only stub
        delete window.visualViewport;
    });

    it("should briefly hide and restore the element to force a repaint on resize", () => {
        const addEventListener = jest.fn();

        window.visualViewport = {
            addEventListener,
            removeEventListener: jest.fn(),
        } as unknown as VisualViewport;

        const element = document.createElement("nav");

        element.style.display = "flex";

        setup(element);

        const [, handleResize] = addEventListener.mock.calls[0] as [
            string,
            () => void,
        ];
        let displayWhenLayoutIsRead: string | undefined;

        jest.spyOn(element, "getBoundingClientRect").mockImplementation(() => {
            displayWhenLayoutIsRead = element.style.display;

            return {} as DOMRect;
        });

        handleResize();

        expect(displayWhenLayoutIsRead).toBe("none");
        expect(element.style.display).toBe("flex");

        // @ts-expect-error - cleaning up the test-only stub
        delete window.visualViewport;
    });
});
