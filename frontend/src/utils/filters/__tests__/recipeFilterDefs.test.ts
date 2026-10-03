import i18next from "i18next";

import {
    activeDefs,
    buildParams,
    readState,
    resetState,
    writeState,
} from "utils/filters/filterState";
import {
    RECIPE_FILTER_DEFS,
    type RecipeFilterState,
} from "utils/filters/recipeFilterDefs";

const t = i18next.getFixedT("en", "recipes");

const EVERY_FILTER_SET: RecipeFilterState = {
    search: "soup",
    types: [1, 2],
    ingredients: [5],
    cookingTime: { min: "10", max: "40" },
    calories: { min: "", max: "600" },
    sort: "rating",
    inPantry: true,
    favourites: true,
    topRated: true,
    excludeAllergens: ["milk", "eggs"],
    hideAvoided: true,
    tags: [3],
    languages: ["uk"],
};

const chipFor = (key: string, value: unknown): string | undefined =>
    RECIPE_FILTER_DEFS.find((def) => def.key === key)?.chipLabel?.(value, t);

describe("RECIPE_FILTER_DEFS", () => {
    it("should start with no filter active", () => {
        expect(
            activeDefs(RECIPE_FILTER_DEFS, resetState(RECIPE_FILTER_DEFS)),
        ).toEqual([]);
    });

    it("should read back every filter it writes, so no two share a URL key", () => {
        const url = writeState(
            RECIPE_FILTER_DEFS,
            { ...EVERY_FILTER_SET },
            new URLSearchParams(),
        );

        expect(readState(RECIPE_FILTER_DEFS, url)).toEqual(EVERY_FILTER_SET);
    });

    it("should send every set filter as its request param", () => {
        expect(
            buildParams(RECIPE_FILTER_DEFS, { ...EVERY_FILTER_SET }),
        ).toEqual({
            recipe_name: "soup",
            type_ids: "1,2",
            ingredient_ids: "5",
            min_cooking_time: "10",
            max_cooking_time: "40",
            max_calories: "600",
            sort_order: "rating",
            in_pantry: true,
            favourites: true,
            top_rated: true,
            exclude_allergens: "milk,eggs",
            hide_avoided: true,
            tag_ids: "3",
            languages: "uk",
        });
    });

    it("should read a shared link's URL into the filter state", () => {
        const state = readState(
            RECIPE_FILTER_DEFS,
            new URLSearchParams("types=4&pantry=1&sort=desc&without=peanuts"),
        );

        expect(state).toEqual(
            expect.objectContaining({
                types: [4],
                inPantry: true,
                sort: "desc",
                excludeAllergens: ["peanuts"],
            }),
        );
    });

    it("should name the sort order on its chip", () => {
        expect(chipFor("sort", "asc")).toBe("Sort: Fast → long");
        expect(chipFor("sort", "desc")).toBe("Sort: Long → fast");
        expect(chipFor("sort", "rating")).toBe("Sort: Top rated");
    });

    it("should count the picked items on the list chips", () => {
        expect(chipFor("types", [1, 2])).toBe("2 types");
        expect(chipFor("ingredients", [1])).toBe("1 ingredient");
        expect(chipFor("excludeAllergens", ["milk", "eggs"])).toBe(
            "Without 2 allergens",
        );
        expect(chipFor("tags", [3])).toBe(
            i18next.t("tags:filter.chip", { count: 1 }),
        );
    });
});
