import i18next from "i18next";

import {
    formatCompactDuration,
    isoDuration,
    splitCookingTime,
} from "utils/cookingTimeUtils";

describe("splitCookingTime", () => {
    it("should split minutes into whole hours and remaining minutes", () => {
        expect(splitCookingTime(90)).toEqual({ hours: 1, minutes: 30 });
    });

    it("should return zero hours when under an hour", () => {
        expect(splitCookingTime(45)).toEqual({ hours: 0, minutes: 45 });
    });

    it("should return zero minutes on a whole hour", () => {
        expect(splitCookingTime(120)).toEqual({ hours: 2, minutes: 0 });
    });

    it("should handle zero", () => {
        expect(splitCookingTime(0)).toEqual({ hours: 0, minutes: 0 });
    });
});

describe("formatCompactDuration", () => {
    const t = i18next.getFixedT(null, "stats");

    it("should show hours and minutes past the hour", () => {
        expect(formatCompactDuration(t, 90)).toBe("1h 30m");
    });

    it("should show only minutes under an hour", () => {
        expect(formatCompactDuration(t, 45)).toBe("45 min");
    });
});

describe("isoDuration", () => {
    it("should write hours and minutes the way schema.org reads them", () => {
        expect(isoDuration(90)).toBe("PT1H30M");
    });

    it("should leave out the hours under an hour", () => {
        expect(isoDuration(45)).toBe("PT45M");
    });

    it("should leave out the minutes on a whole hour", () => {
        expect(isoDuration(120)).toBe("PT2H");
    });

    it("should still name a unit for zero", () => {
        expect(isoDuration(0)).toBe("PT0M");
    });
});
