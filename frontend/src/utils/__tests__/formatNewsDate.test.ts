import { formatNewsDate, formatNewsDateShort } from "utils/formatNewsDate";

const RELEASE_DATE = "2026-07-02";

describe("formatNewsDate", () => {
    it("should print the month, day and year", () => {
        expect(formatNewsDate(RELEASE_DATE, "en")).toBe("Jul 2, 2026");
    });

    it("should keep the calendar day of the ISO date at the first of a month", () => {
        expect(formatNewsDate("2026-08-01", "en")).toBe("Aug 1, 2026");
    });
});

describe("formatNewsDateShort", () => {
    it("should print the month and day without the year", () => {
        expect(formatNewsDateShort(RELEASE_DATE, "en")).toBe("Jul 2");
    });
});
