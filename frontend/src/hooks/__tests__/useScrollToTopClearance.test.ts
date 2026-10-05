import { act, renderHook } from "@testing-library/react";
import { useRef } from "react";

import { useScrollToTopClearance } from "hooks/useScrollToTopClearance";

const VIEWPORT_HEIGHT = 768;
const CLEARANCE_HEIGHT = 44;

const setPageHeight = (height: number) => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
        configurable: true,
        value: height,
    });
};

const render = (clearance: HTMLElement | null = null) =>
    renderHook(() => {
        const clearanceRef = useRef(clearance);

        return useScrollToTopClearance(clearanceRef);
    });

beforeEach(() => {
    window.innerHeight = VIEWPORT_HEIGHT;
});

afterEach(() => {
    setPageHeight(0);
});

describe("useScrollToTopClearance", () => {
    it("should make room under a page long enough to show the button", () => {
        setPageHeight(2000);

        const { result } = render();

        expect(result.current).toBe(true);
    });

    it("should not lengthen a page that almost fits the screen", () => {
        setPageHeight(VIEWPORT_HEIGHT + 51);

        const { result } = render();

        expect(result.current).toBe(false);
    });

    it("should measure the page without the room it already made", () => {
        const clearance = document.createElement("div");

        Object.defineProperty(clearance, "offsetHeight", {
            configurable: true,
            value: CLEARANCE_HEIGHT,
        });
        setPageHeight(VIEWPORT_HEIGHT + 240 + CLEARANCE_HEIGHT);

        const { result } = render(clearance);

        expect(result.current).toBe(false);
    });

    it("should measure again when the window is resized", () => {
        setPageHeight(1100);

        const { result } = render();

        act(() => {
            window.innerHeight = 1000;
            window.dispatchEvent(new Event("resize"));
        });

        expect(result.current).toBe(false);
    });
});
