import {
    barHeightPercent,
    dayTone,
    formatHistoryDay,
    formatWeekday,
    goalLinePercent,
    historyMaxValue,
    parseDateKey,
} from "utils/calorieHistory";

const WEDNESDAY = "2026-01-14";

describe("parseDateKey", () => {
    it("should read the key as a local calendar day, not UTC midnight", () => {
        const date = parseDateKey(WEDNESDAY);

        expect(date.getFullYear()).toBe(2026);
        expect(date.getMonth()).toBe(0);
        expect(date.getDate()).toBe(14);
        expect(date.getHours()).toBe(0);
    });
});

describe("formatWeekday", () => {
    it("should name the weekday in the page language", () => {
        expect(formatWeekday(WEDNESDAY, "en")).toBe("Wed");
        expect(formatWeekday(WEDNESDAY, "pl")).toBe("śr.");
    });
});

describe("formatHistoryDay", () => {
    it("should name the weekday and the date in the page language", () => {
        expect(formatHistoryDay(WEDNESDAY, "en")).toBe("Wednesday, January 14");
    });
});

describe("historyMaxValue", () => {
    it("should take the larger of the goal and the biggest day", () => {
        const days = [
            { date: "2026-01-13", consumed: 2600 },
            { date: WEDNESDAY, consumed: 900 },
        ];

        expect(historyMaxValue(2000, days)).toBe(2600);
        expect(historyMaxValue(3000, days)).toBe(3000);
    });

    it("should never be zero, so a bar height never divides by it", () => {
        expect(historyMaxValue(0, [])).toBe(1);
    });
});

describe("barHeightPercent", () => {
    it("should scale the day against the chart maximum", () => {
        expect(barHeightPercent(500, 2000)).toBe(25);
    });
});

describe("goalLinePercent", () => {
    it("should place the goal line against the chart maximum", () => {
        expect(goalLinePercent(1000, 2000)).toBe(50);
    });

    it("should cap the goal line at the top of the chart", () => {
        expect(goalLinePercent(3000, 2000)).toBe(100);
    });
});

describe("dayTone", () => {
    it("should tone a day by how close it came to the goal", () => {
        expect(dayTone({ date: WEDNESDAY, consumed: 1000 }, 2000)).toBe(
            "normal",
        );
        expect(dayTone({ date: WEDNESDAY, consumed: 1800 }, 2000)).toBe("near");
        expect(dayTone({ date: WEDNESDAY, consumed: 2600 }, 2000)).toBe("over");
    });
});
