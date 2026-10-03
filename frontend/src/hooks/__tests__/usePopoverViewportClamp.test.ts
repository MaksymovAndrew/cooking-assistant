import { act, renderHook } from "@testing-library/react";
import { useRef } from "react";

import { usePopoverViewportClamp } from "hooks/usePopoverViewportClamp";

const VIEWPORT_HEIGHT = 768;

const setup = (triggerBottom: number, isActive = true) => {
    const container = document.createElement("div");
    const popover = document.createElement("div");

    jest.spyOn(container, "getBoundingClientRect").mockImplementation(
        () => new DOMRect(0, triggerBottom - 40, 200, 40),
    );

    const view = renderHook(() => {
        const containerRef = useRef(container);
        const popoverRef = useRef(popover);

        usePopoverViewportClamp(containerRef, popoverRef, isActive);
    });

    return { popover, ...view };
};

const resizeViewport = (height: number) => {
    act(() => {
        window.innerHeight = height;
        window.dispatchEvent(new Event("resize"));
    });
};

beforeEach(() => {
    window.innerHeight = VIEWPORT_HEIGHT;
});

describe("usePopoverViewportClamp", () => {
    it("should cap the popover at the space left below its trigger", () => {
        const { popover } = setup(300);

        expect(popover.style.maxHeight).toBe("444px");
    });

    it("should never cap the popover below its minimum height", () => {
        const { popover } = setup(700);

        expect(popover.style.maxHeight).toBe("160px");
    });

    it("should clamp again when the viewport resizes", () => {
        const { popover } = setup(300);

        resizeViewport(600);

        expect(popover.style.maxHeight).toBe("276px");
    });

    it("should leave a closed popover alone", () => {
        const { popover } = setup(300, false);

        expect(popover.style.maxHeight).toBe("");
    });

    it("should stop following the viewport once unmounted", () => {
        const { popover, unmount } = setup(300);

        unmount();
        resizeViewport(600);

        expect(popover.style.maxHeight).toBe("444px");
    });
});
