import { computeThumb } from "components/ui/HorizontalScrollbar/thumbMetrics";

const makeElement = (
    scrollWidth: number,
    clientWidth: number,
    scrollLeft: number,
): HTMLElement => {
    const el = document.createElement("div");

    Object.defineProperty(el, "scrollWidth", { value: scrollWidth });
    Object.defineProperty(el, "clientWidth", { value: clientWidth });
    Object.defineProperty(el, "scrollLeft", { value: scrollLeft });

    return el;
};

describe("computeThumb", () => {
    it("should return null when the content fits", () => {
        expect(computeThumb(makeElement(300, 300, 0))).toBeNull();
    });

    it("should size the thumb to the visible share of the content", () => {
        expect(computeThumb(makeElement(400, 100, 0))).toEqual({
            widthPercent: 25,
            offsetPercent: 0,
        });
    });

    it("should move the thumb to the end when scrolled all the way", () => {
        expect(computeThumb(makeElement(400, 100, 300))).toEqual({
            widthPercent: 25,
            offsetPercent: 75,
        });
    });
});
