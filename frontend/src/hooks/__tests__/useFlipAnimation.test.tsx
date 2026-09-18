import { render } from "@testing-library/react";
import React, { useRef } from "react";

import { FLIP_ID_ATTRIBUTE, useFlipAnimation } from "hooks/useFlipAnimation";

const ROW_HEIGHT = 40;

// jsdom lays nothing out, so a row reports its top from its place in the last rendered order
let renderedOrder: string[] = [];
// rows styled display: none - jsdom would report their box as empty
let hiddenIds = new Set<string>();
const originalMatchMedia = window.matchMedia;

interface ListProps {
    ids: string[];
}

const List: React.FC<ListProps> = ({ ids }) => {
    const ref = useRef<HTMLUListElement>(null);

    useFlipAnimation(ref, ids.join(","));

    return (
        <ul ref={ref}>
            {ids.map((id) => (
                <li key={id} {...{ [FLIP_ID_ATTRIBUTE]: id }}>
                    {id}
                </li>
            ))}
        </ul>
    );
};

const mountList = (ids: string[]) => {
    renderedOrder = ids;
    const view = render(<List ids={ids} />);

    // hands back a way to re-render the same list in a new order
    return (nextIds: string[]) => {
        renderedOrder = nextIds;
        view.rerender(<List ids={nextIds} />);
    };
};

const animate = jest.fn();

const rowRect = function (this: HTMLElement): DOMRect {
    const index = renderedOrder.indexOf(this.textContent);

    if (hiddenIds.has(this.textContent)) {
        return new DOMRect(0, 0, 0, 0);
    }

    return new DOMRect(0, index * ROW_HEIGHT, 100, ROW_HEIGHT);
};

describe("useFlipAnimation", () => {
    beforeEach(() => {
        animate.mockClear();
        hiddenIds = new Set();
        HTMLElement.prototype.animate = animate;
        jest.spyOn(
            HTMLElement.prototype,
            "getBoundingClientRect",
        ).mockImplementation(rowRect);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        window.matchMedia = originalMatchMedia;
    });

    it("should only record positions on the first render", () => {
        mountList(["a", "b"]);

        expect(animate).not.toHaveBeenCalled();
    });

    it("should slide swapped rows from their old place to the new one", () => {
        const reorderTo = mountList(["a", "b"]);

        reorderTo(["b", "a"]);

        expect(animate).toHaveBeenCalledWith(
            [{ transform: "translate(0px, 40px)" }, { transform: "none" }],
            expect.objectContaining({ duration: 280 }),
        );
        expect(animate).toHaveBeenCalledWith(
            [{ transform: "translate(0px, -40px)" }, { transform: "none" }],
            expect.objectContaining({ duration: 280 }),
        );
    });

    it("should fade in a row that was not there before", () => {
        const reorderTo = mountList(["a"]);

        reorderTo(["a", "b"]);

        expect(animate).toHaveBeenCalledTimes(1);
        expect(animate).toHaveBeenCalledWith(
            [
                { opacity: 0, transform: "translateY(-6px)" },
                { opacity: 1, transform: "none" },
            ],
            expect.objectContaining({ duration: 220 }),
        );
    });

    it("should fade in an element that was hidden instead of flying it in from the page origin", () => {
        hiddenIds = new Set(["b"]);
        const reorderTo = mountList(["a", "b"]);

        hiddenIds = new Set();
        reorderTo(["b", "a"]);

        expect(animate).toHaveBeenCalledTimes(2);
        expect(animate).toHaveBeenCalledWith(
            [
                { opacity: 0, transform: "translateY(-6px)" },
                { opacity: 1, transform: "none" },
            ],
            expect.objectContaining({ duration: 220 }),
        );
        expect(animate).toHaveBeenCalledWith(
            [{ transform: "translate(0px, -40px)" }, { transform: "none" }],
            expect.objectContaining({ duration: 280 }),
        );
    });

    it("should not animate anything when the user prefers reduced motion", () => {
        window.matchMedia = jest.fn().mockReturnValue({ matches: true });
        const reorderTo = mountList(["a", "b"]);

        reorderTo(["b", "a"]);

        expect(animate).not.toHaveBeenCalled();
    });
});
