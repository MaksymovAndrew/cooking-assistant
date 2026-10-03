import { fireEvent, render, screen } from "@testing-library/react";

import { HorizontalScrollbar } from "components/ui/HorizontalScrollbar";

interface ScrollMetrics {
    scrollWidth: number;
    clientWidth: number;
    scrollLeft?: number;
}

const makeScrollElement = ({
    scrollWidth,
    clientWidth,
    scrollLeft = 0,
}: ScrollMetrics): HTMLDivElement => {
    const el = document.createElement("div");
    let currentScrollLeft = scrollLeft;

    Object.defineProperty(el, "scrollWidth", {
        value: scrollWidth,
        configurable: true,
    });
    Object.defineProperty(el, "clientWidth", {
        value: clientWidth,
        configurable: true,
    });
    Object.defineProperty(el, "scrollLeft", {
        get: () => currentScrollLeft,
        set: (value: number) => {
            currentScrollLeft = value;
        },
        configurable: true,
    });

    return el;
};

describe("HorizontalScrollbar", () => {
    it("should render nothing when the content already fits", () => {
        const el = makeScrollElement({ scrollWidth: 300, clientWidth: 300 });

        render(<HorizontalScrollbar scrollRef={{ current: el }} />);

        expect(
            screen.queryByTestId("horizontal-scrollbar-track"),
        ).not.toBeInTheDocument();
    });

    it("should scroll to the clicked position when the track is dragged", () => {
        const el = makeScrollElement({ scrollWidth: 400, clientWidth: 200 });

        render(<HorizontalScrollbar scrollRef={{ current: el }} />);

        const track = screen.getByTestId("horizontal-scrollbar-track");

        track.getBoundingClientRect = () =>
            ({ left: 0, width: 200 }) as DOMRect;

        // jsdom has no PointerEvent, so fireEvent.pointerDown would drop clientX and pointerId
        const pointerDown = new Event("pointerdown", { bubbles: true });

        Object.defineProperty(pointerDown, "clientX", { value: 100 });
        Object.defineProperty(pointerDown, "pointerId", { value: 1 });
        fireEvent(track, pointerDown);

        // clientX 100 of a 200-wide track = 50% ratio * scrollWidth 400 = 200
        expect(el.scrollLeft).toBe(200);
    });
});
