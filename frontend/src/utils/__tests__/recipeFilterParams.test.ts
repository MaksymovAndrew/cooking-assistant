import type { Ingredient } from "types/ingredient";

import type { RecipeFiltersState } from "redux/slices/filtersSlice";

import {
    buildRecipeFilterParams,
    matchIngredientIds,
} from "utils/recipeFilterParams";

const EMPTY: RecipeFiltersState = {
    selectedTypes: [],
    startDate: "",
    endDate: "",
    minCookingTime: "",
    maxCookingTime: "",
    sortOrder: "asc",
};

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

describe("buildRecipeFilterParams", () => {
    it("should build minimal params with no ingredient_ids when none are given", () => {
        expect(buildRecipeFilterParams(EMPTY, undefined)).toEqual({
            ingredient_ids: undefined,
            sort_order: "asc",
            type_ids: undefined,
            start_date: undefined,
            end_date: undefined,
            min_cooking_time: undefined,
            max_cooking_time: undefined,
        });
    });

    it("should map all set fields into the query params", () => {
        const filters: RecipeFiltersState = {
            selectedTypes: [1, 2],
            startDate: "2024-01-01",
            endDate: "2024-02-01",
            minCookingTime: "10",
            maxCookingTime: "90",
            sortOrder: "desc",
        };

        expect(buildRecipeFilterParams(filters, "1,2")).toEqual({
            ingredient_ids: "1,2",
            sort_order: "desc",
            type_ids: "1,2",
            start_date: "2024-01-01",
            end_date: "2024-02-01",
            min_cooking_time: "10",
            max_cooking_time: "90",
        });
    });
});
