import i18next from "i18next";

import { MENU_DURATION_COPY } from "constants/durationCopy";

import {
    formatCompactDuration,
    formatDuration,
    formatRecipeDuration,
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

describe("formatRecipeDuration", () => {
    const t = i18next.getFixedT(null, "recipes");

    it("should name the hours and minutes from an hour on", () => {
        expect(formatRecipeDuration(t, 90)).toBe("1 hr 30 min");
    });

    it("should name only the minutes under an hour", () => {
        expect(formatRecipeDuration(t, 59)).toBe("59 min");
    });

    it("should name only the hours on a whole hour", () => {
        expect(formatRecipeDuration(t, 120)).toBe("2 hr");
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

    it("should show only hours on a whole hour", () => {
        expect(formatCompactDuration(t, 420)).toBe("7h");
    });
});

describe("formatDuration", () => {
    const t = i18next.getFixedT(null, "menu");

    it("should read the copy keys it is given", () => {
        expect(formatDuration(t, 90, MENU_DURATION_COPY)).toBe("1h 30m");
        expect(formatDuration(t, 60, MENU_DURATION_COPY)).toBe("1h");
        expect(formatDuration(t, 25, MENU_DURATION_COPY)).toBe("25 min");
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
