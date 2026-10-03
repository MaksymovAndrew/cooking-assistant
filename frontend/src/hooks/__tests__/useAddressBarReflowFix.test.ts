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
    // jsdom has no VisualViewport, so a plain event target stands in for its resize events
    const viewport = new EventTarget();

    beforeEach(() => {
        Object.defineProperty(window, "visualViewport", {
            configurable: true,
            value: viewport,
        });
    });

    afterEach(() => {
        Object.defineProperty(window, "visualViewport", {
            configurable: true,
            value: null,
        });
    });

    it("should briefly hide and restore the element to force a repaint on each resize until unmounted", () => {
        const element = document.createElement("nav");
        const displaysWhenLayoutIsRead: string[] = [];

        element.style.display = "flex";
        jest.spyOn(element, "getBoundingClientRect").mockImplementation(() => {
            displaysWhenLayoutIsRead.push(element.style.display);

            return new DOMRect();
        });

        const { unmount } = setup(element);

        viewport.dispatchEvent(new Event("resize"));

        expect(displaysWhenLayoutIsRead).toEqual(["none"]);
        expect(element.style.display).toBe("flex");

        unmount();
        viewport.dispatchEvent(new Event("resize"));

        expect(displaysWhenLayoutIsRead).toEqual(["none"]);
    });
});
