import {
    formatKcal,
    roundCalories,
    scaleCaloriesForPortions,
    sumIngredientCalories,
} from "utils/calories";

describe("roundCalories", () => {
    it("should round to the nearest whole calorie", () => {
        expect(roundCalories(21.6)).toBe(22);
        expect(roundCalories(21.4)).toBe(21);
    });
});

describe("scaleCaloriesForPortions", () => {
    it("should multiply the rounded per-portion value by the portion count", () => {
        expect(scaleCaloriesForPortions(22, 2)).toBe(44);
    });

    it("should round the per-portion value before multiplying, not after", () => {
        // 21.6 rounds to 22 for one portion - two portions must read 44 (22 * 2), not 43
        // (round(21.6 * 2) = round(43.2) = 43)
        expect(scaleCaloriesForPortions(21.6, 2)).toBe(44);
    });

    it("should equal the rounded per-portion value for a single portion", () => {
        expect(scaleCaloriesForPortions(21.6, 1)).toBe(22);
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

describe("formatKcal", () => {
    it("should add a thousands separator", () => {
        expect(formatKcal(1180)).toBe("1,180");
    });

    it("should leave a small number unchanged", () => {
        expect(formatKcal(320)).toBe("320");
    });
});
