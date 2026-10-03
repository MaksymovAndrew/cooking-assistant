import { formatRatingAverage } from "utils/formatRating";

describe("formatRatingAverage", () => {
    it("should print a whole average with one decimal", () => {
        expect(formatRatingAverage(4, "en")).toBe("4.0");
    });

    it("should round an unrounded average to one decimal", () => {
        expect(formatRatingAverage(4.26, "en")).toBe("4.3");
    });

    it("should use the language's decimal separator", () => {
        expect(formatRatingAverage(4.5, "pl")).toBe("4,5");
    });
});
