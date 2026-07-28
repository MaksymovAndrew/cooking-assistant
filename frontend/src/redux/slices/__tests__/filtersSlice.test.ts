import {
    filtersReducer,
    setMenuSelectedCategories,
    setRecipeEndDate,
    setRecipeInPantry,
    setRecipeMaxCookingTime,
    setRecipeMinCookingTime,
    setRecipeSelectedTypes,
    setRecipeSortOrder,
    setRecipeStartDate,
} from "redux/slices/filtersSlice";

const initial = () => filtersReducer(undefined, { type: "@@INIT" });

describe("filtersSlice", () => {
    it("should start with empty recipe and menu filters", () => {
        expect(initial()).toEqual({
            recipe: {
                selectedTypes: [],
                startDate: "",
                endDate: "",
                minCookingTime: "",
                maxCookingTime: "",
                sortOrder: "asc",
                inPantry: false,
            },
            menu: { selectedCategories: [] },
        });
    });

    it("should set the recipe selected types", () => {
        expect(
            filtersReducer(undefined, setRecipeSelectedTypes([1, 2])).recipe
                .selectedTypes,
        ).toEqual([1, 2]);
    });

    it("should set the recipe start date", () => {
        expect(
            filtersReducer(undefined, setRecipeStartDate("2024-01-01")).recipe
                .startDate,
        ).toBe("2024-01-01");
    });

    it("should set the recipe end date", () => {
        expect(
            filtersReducer(undefined, setRecipeEndDate("2024-02-01")).recipe
                .endDate,
        ).toBe("2024-02-01");
    });

    it("should set the recipe min cooking time", () => {
        expect(
            filtersReducer(undefined, setRecipeMinCookingTime("10")).recipe
                .minCookingTime,
        ).toBe("10");
    });

    it("should set the recipe max cooking time", () => {
        expect(
            filtersReducer(undefined, setRecipeMaxCookingTime("90")).recipe
                .maxCookingTime,
        ).toBe("90");
    });

    it("should set the recipe sort order", () => {
        expect(
            filtersReducer(undefined, setRecipeSortOrder("desc")).recipe
                .sortOrder,
        ).toBe("desc");
    });

    it("should set the recipe in-pantry filter", () => {
        expect(
            filtersReducer(undefined, setRecipeInPantry(true)).recipe.inPantry,
        ).toBe(true);
    });

    it("should set the menu selected categories", () => {
        expect(
            filtersReducer(undefined, setMenuSelectedCategories([3, 4])).menu
                .selectedCategories,
        ).toEqual([3, 4]);
    });
});
