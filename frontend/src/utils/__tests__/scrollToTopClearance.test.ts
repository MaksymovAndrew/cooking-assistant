import { needsScrollToTopClearance } from "utils/scrollToTopClearance";

const VIEWPORT_HEIGHT = 800;

describe("needsScrollToTopClearance", () => {
    it("should make room under a page that scrolls far enough to show the button", () => {
        expect(needsScrollToTopClearance(2000, VIEWPORT_HEIGHT)).toBe(true);
    });

    it("should not lengthen a page that almost fits the screen", () => {
        expect(needsScrollToTopClearance(807, VIEWPORT_HEIGHT)).toBe(false);
    });

    it("should leave a page that scrolls exactly to the reveal offset alone", () => {
        expect(needsScrollToTopClearance(1040, VIEWPORT_HEIGHT)).toBe(false);
    });
});
