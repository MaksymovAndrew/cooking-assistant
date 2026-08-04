import {
    computeBestStreak,
    computeDailyIntake,
    computeStreak,
    isDayInBudget,
} from "utils/computeDailyIntake";

const NOW = new Date(2026, 0, 14, 12, 0, 0);
const TODAY_DATE_KEY = "2026-01-14";

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
});

afterEach(() => {
    jest.useRealTimers();
});

const isoOnDay = (dayOffset: number) =>
    new Date(2026, 0, 14 - dayOffset, 18, 0, 0).toISOString();

describe("computeDailyIntake", () => {
    it("should bucket entries into local calendar days, oldest first", () => {
        const days = computeDailyIntake(
            [
                { eaten_at: isoOnDay(0), calories: 300 },
                { eaten_at: isoOnDay(1), calories: 500 },
                { eaten_at: isoOnDay(1), calories: 100 },
            ],
            3,
        );

        expect(days).toHaveLength(3);
        expect(days[0].consumed).toBe(0);
        expect(days[1].consumed).toBe(600);
        expect(days[2].consumed).toBe(300);
        expect(days[2].date).toBe(TODAY_DATE_KEY);
    });

    it("should return an empty-consumed bucket for a day with no entries", () => {
        const days = computeDailyIntake([], 2);

        expect(days.map((day) => day.consumed)).toEqual([0, 0]);
    });

    it("should anchor on an explicit day key instead of the current day", () => {
        const days = computeDailyIntake(
            [
                {
                    eaten_at: new Date(2026, 0, 10, 18).toISOString(),
                    calories: 400,
                },
            ],
            2,
            new Date(2026, 0, 10).toDateString(),
        );

        expect(days.map((day) => day.consumed)).toEqual([0, 400]);
    });
});

describe("computeStreak", () => {
    it("should count consecutive in-budget days ending yesterday, excluding today", () => {
        const days = computeDailyIntake(
            [
                { eaten_at: isoOnDay(0), calories: 5000 },
                { eaten_at: isoOnDay(1), calories: 1800 },
                { eaten_at: isoOnDay(2), calories: 1900 },
                { eaten_at: isoOnDay(3), calories: 2500 },
            ],
            4,
        );

        expect(computeStreak(days, 2000)).toBe(2);
    });

    it("should return 0 when there is no goal", () => {
        const days = computeDailyIntake([], 3);

        expect(computeStreak(days, null)).toBe(0);
    });

    it("should return 0 when yesterday had no entries logged", () => {
        const days = computeDailyIntake(
            [{ eaten_at: isoOnDay(2), calories: 1000 }],
            3,
        );

        expect(computeStreak(days, 2000)).toBe(0);
    });
});

describe("isDayInBudget", () => {
    it("should be true for a day with some consumption at or under the goal", () => {
        expect(
            isDayInBudget({ date: TODAY_DATE_KEY, consumed: 1800 }, 2000),
        ).toBe(true);
    });

    it("should be false for a day over the goal", () => {
        expect(
            isDayInBudget({ date: TODAY_DATE_KEY, consumed: 2500 }, 2000),
        ).toBe(false);
    });

    it("should be false for a day with nothing logged, even under the goal", () => {
        expect(isDayInBudget({ date: TODAY_DATE_KEY, consumed: 0 }, 2000)).toBe(
            false,
        );
    });
});

describe("computeBestStreak", () => {
    it("should find the longest in-budget run in the window, excluding today", () => {
        const days = computeDailyIntake(
            [
                { eaten_at: isoOnDay(0), calories: 1800 },
                { eaten_at: isoOnDay(1), calories: 1900 },
                { eaten_at: isoOnDay(2), calories: 2500 },
                { eaten_at: isoOnDay(3), calories: 1700 },
                { eaten_at: isoOnDay(4), calories: 1600 },
                { eaten_at: isoOnDay(5), calories: 1500 },
            ],
            6,
        );

        expect(computeBestStreak(days, 2000)).toBe(3);
    });

    it("should not let today's still-in-progress total claim a best streak on its own", () => {
        const days = computeDailyIntake(
            [{ eaten_at: isoOnDay(0), calories: 198 }],
            7,
        );

        expect(computeBestStreak(days, 3000)).toBe(0);
    });
});
