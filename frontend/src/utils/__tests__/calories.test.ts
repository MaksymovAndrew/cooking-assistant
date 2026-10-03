import {
    calorieRingFraction,
    exceedsCalorieBudget,
    exceedsCalorieBudgetForPortions,
    formatKcalCompact,
    roundCalories,
    scaleCaloriesForPortions,
    sumIngredientCalories,
} from "utils/calories";

const LOCALE = "en";

describe("roundCalories", () => {
    it("should round to the nearest whole calorie", () => {
        expect(roundCalories(21.6)).toBe(22);
        expect(roundCalories(21.4)).toBe(21);
    });
});

describe("calorieRingFraction", () => {
    it("should fill the ring by the share of the goal eaten so far", () => {
        expect(calorieRingFraction(500, 2000)).toBe(0.25);
    });

    it("should stop at a full ring once the goal is passed", () => {
        expect(calorieRingFraction(2600, 2000)).toBe(1);
    });

    it("should leave the ring empty without a goal", () => {
        expect(calorieRingFraction(500, 0)).toBe(0);
    });
});

describe("scaleCaloriesForPortions", () => {
    it("should multiply the rounded per-portion value by the portion count", () => {
        expect(scaleCaloriesForPortions(22, 2)).toBe(44);
    });

    it("should round the per-portion value before multiplying, not after", () => {
        // round(21.6) * 2 = 44, while round(21.6 * 2) would be 43
        expect(scaleCaloriesForPortions(21.6, 2)).toBe(44);
    });
});

describe("sumIngredientCalories", () => {
    it("should sum quantity times calories per unit across ingredients", () => {
        expect(
            sumIngredientCalories([
                { quantity: 2, calories_per_unit: 50 },
                { quantity: 3, calories_per_unit: 10 },
            ]),
        ).toBe(130);
    });

    it("should treat an ingredient with no catalog calorie value as contributing zero", () => {
        expect(
            sumIngredientCalories([
                { quantity: 2, calories_per_unit: 50 },
                { quantity: 5, calories_per_unit: null },
            ]),
        ).toBe(100);
    });

    it("should return 0 for an empty list", () => {
        expect(sumIngredientCalories([])).toBe(0);
    });
});

describe("exceedsCalorieBudget", () => {
    it("should be true when the recipe costs more than what's left today", () => {
        expect(exceedsCalorieBudget(700, 2000, 500)).toBe(true);
    });

    it("should be false when the recipe fits within what's left today", () => {
        expect(exceedsCalorieBudget(300, 2000, 500)).toBe(false);
    });

    it("should be true for any recipe once already over budget for the day", () => {
        expect(exceedsCalorieBudget(50, 2000, -100)).toBe(true);
    });

    it("should be false when no goal is set", () => {
        expect(exceedsCalorieBudget(700, null, null)).toBe(false);
    });

    it("should be false when the recipe has no calorie data", () => {
        expect(exceedsCalorieBudget(null, 2000, 500)).toBe(false);
    });
});

describe("exceedsCalorieBudgetForPortions", () => {
    it("should scale the per-portion value by the portion count before comparing", () => {
        expect(exceedsCalorieBudgetForPortions(300, 2, 2000, 500)).toBe(true);
    });

    it("should be false when the scaled total still fits the remaining budget", () => {
        expect(exceedsCalorieBudgetForPortions(200, 2, 2000, 500)).toBe(false);
    });

    it("should be false when the recipe has no calorie data", () => {
        expect(exceedsCalorieBudgetForPortions(null, 2, 2000, 500)).toBe(false);
    });
});

describe("formatKcalCompact", () => {
    it("should abbreviate thousands with a lowercase suffix", () => {
        expect(formatKcalCompact(13_333, LOCALE)).toBe("13k");
    });

    it("should leave a number under a thousand unchanged", () => {
        expect(formatKcalCompact(320, LOCALE)).toBe("320");
    });
});
