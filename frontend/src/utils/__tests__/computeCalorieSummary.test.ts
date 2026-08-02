import {
    calorieToneFor,
    computeCalorieSummary,
} from "utils/computeCalorieSummary";

describe("computeCalorieSummary", () => {
    it("should sum consumed calories and leave goal-relative fields null when there is no goal", () => {
        const summary = computeCalorieSummary(
            [{ calories: 300 }, { calories: 150 }],
            null,
        );

        expect(summary).toEqual({
            consumed: 450,
            remaining: null,
            percent: null,
            isOverLimit: false,
            isNearLimit: false,
        });
    });

    it("should compute remaining and percent against the goal when comfortably under it", () => {
        const summary = computeCalorieSummary([{ calories: 1000 }], 2000);

        expect(summary.remaining).toBe(1000);
        expect(summary.percent).toBe(0.5);
        expect(summary.isOverLimit).toBe(false);
        expect(summary.isNearLimit).toBe(false);
    });

    it("should flag isNearLimit at the 85% threshold without being over", () => {
        const summary = computeCalorieSummary([{ calories: 1700 }], 2000);

        expect(summary.percent).toBeCloseTo(0.85);
        expect(summary.isNearLimit).toBe(true);
        expect(summary.isOverLimit).toBe(false);
    });

    it("should flag isOverLimit and return a negative remaining once consumed exceeds the goal", () => {
        const summary = computeCalorieSummary([{ calories: 2500 }], 2000);

        expect(summary.remaining).toBe(-500);
        expect(summary.isOverLimit).toBe(true);
        expect(summary.isNearLimit).toBe(true);
    });

    it("should treat a zero goal as 0% instead of dividing by zero", () => {
        const summary = computeCalorieSummary([{ calories: 100 }], 0);

        expect(summary.percent).toBe(0);
        expect(summary.isOverLimit).toBe(true);
    });

    it("should return zero consumed for an empty log", () => {
        const summary = computeCalorieSummary([], 2000);

        expect(summary.consumed).toBe(0);
        expect(summary.remaining).toBe(2000);
    });
});

describe("calorieToneFor", () => {
    it("should return normal when comfortably under the goal", () => {
        expect(calorieToneFor({ isOverLimit: false, isNearLimit: false })).toBe(
            "normal",
        );
    });

    it("should return near when close to the goal", () => {
        expect(calorieToneFor({ isOverLimit: false, isNearLimit: true })).toBe(
            "near",
        );
    });

    it("should return over when past the goal", () => {
        expect(calorieToneFor({ isOverLimit: true, isNearLimit: true })).toBe(
            "over",
        );
    });
});
