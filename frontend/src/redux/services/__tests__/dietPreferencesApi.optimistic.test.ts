import type { DietPreferences } from "types/dietPreferences";

import {
    patchAllergens,
    patchIngredients,
    withAdded,
    without,
} from "redux/services/dietPreferencesApi.optimistic";

const makePreferences = (): DietPreferences => ({
    allergens: ["milk"],
    ingredient_ids: [1],
});

describe("dietPreferencesApi.optimistic", () => {
    describe("without", () => {
        it("should drop the value from the list", () => {
            expect(without([1, 2, 3], 2)).toEqual([1, 3]);
        });
    });

    describe("withAdded", () => {
        it("should append a value the list lacks", () => {
            expect(withAdded([1], 2)).toEqual([1, 2]);
        });

        it("should leave a list that already holds the value unchanged", () => {
            const values = [1, 2];

            expect(withAdded(values, 2)).toBe(values);
        });
    });

    describe("patchAllergens", () => {
        it("should add an allergen to the avoid list", () => {
            const preferences = makePreferences();

            patchAllergens("gluten", withAdded)(preferences);

            expect(preferences.allergens).toEqual(["milk", "gluten"]);
        });

        it("should remove an allergen from the avoid list", () => {
            const preferences = makePreferences();

            patchAllergens("milk", without)(preferences);

            expect(preferences.allergens).toEqual([]);
        });
    });

    describe("patchIngredients", () => {
        it("should add an ingredient to the avoid list", () => {
            const preferences = makePreferences();

            patchIngredients(7, withAdded)(preferences);

            expect(preferences.ingredient_ids).toEqual([1, 7]);
        });

        it("should remove an ingredient from the avoid list", () => {
            const preferences = makePreferences();

            patchIngredients(1, without)(preferences);

            expect(preferences.ingredient_ids).toEqual([]);
        });
    });
});
