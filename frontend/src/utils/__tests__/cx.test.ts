import { cx } from "utils/cx";

const cardClass = (isActive: boolean) =>
    cx("card", isActive && "card--active", null, undefined, "wide");

describe("cx", () => {
    it("should join class names and drop the ones switched off", () => {
        expect(cardClass(false)).toBe("card wide");
        expect(cardClass(true)).toBe("card card--active wide");
    });

    it("should return an empty string when nothing is on", () => {
        expect(cx(false, null)).toBe("");
    });
});
