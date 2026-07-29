import type { Ingredient } from "types/ingredient";

import { matchIngredientIds } from "utils/recipeFilterParams";

const CATALOG: Ingredient[] = [
    {
        id: 1,
        slug: "egg",
        name: "Egg",
        category: "eggs",
        unit_name: "piece",
        allergens: ["eggs"],
        days_to_expire: 21,
        calories_per_unit: null,
    },
    {
        id: 2,
        slug: "eggplant",
        name: "Eggplant",
        category: "vegetables",
        unit_name: "piece",
        allergens: [],
        days_to_expire: 10,
        calories_per_unit: null,
    },
];

describe("matchIngredientIds", () => {
    it("should return undefined when no search text is given", () => {
        expect(matchIngredientIds(null, CATALOG)).toBeUndefined();
        expect(matchIngredientIds("", CATALOG)).toBeUndefined();
        expect(matchIngredientIds("   ", CATALOG)).toBeUndefined();
    });

    it("should return a comma-separated list of every catalog ingredient matching the text", () => {
        expect(matchIngredientIds("egg", CATALOG)).toBe("1,2");
    });

    it("should return undefined when the text matches no catalog ingredient", () => {
        expect(matchIngredientIds("zzz", CATALOG)).toBeUndefined();
    });
});
