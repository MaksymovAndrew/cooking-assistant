import type { Menu } from "types/menu";
import type { RecipeWithIngredientNames } from "types/recipe";

import {
    selectMenuStatistics,
    selectRecipeStatistics,
} from "redux/selectors/statisticsSelectors";
import { menusApi } from "redux/services/menusApi";
import { recipesApi } from "redux/services/recipesApi";

import { mockedGet } from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const RECIPES: RecipeWithIngredientNames[] = [
    {
        id: 1,
        title: "A",
        type_name: "Soup",
        creation_date: "2024-01-01",
        cooking_time: 10,
        ingredients: ["x"],
    },
    {
        id: 2,
        title: "B",
        type_name: "Soup",
        creation_date: "2024-01-02",
        cooking_time: 30,
        ingredients: ["x", "y"],
    },
    {
        id: 3,
        title: "C",
        type_name: "Salad",
        creation_date: "2024-01-03",
        cooking_time: 20,
        ingredients: ["x", "y", "z"],
    },
];

const MENUS: Menu[] = [
    { id: 1, title: "M1", categoryname: "Lunch", menucontent: "" },
    { id: 2, title: "M2", categoryname: "Lunch", menucontent: "" },
    { id: 3, title: "M3", categoryname: "Dinner", menucontent: "" },
];

const loadRecipes = async (store: ReturnType<typeof makeTestStore>) => {
    mockedGet.mockResolvedValue({ data: RECIPES });
    await store.dispatch(recipesApi.endpoints.getAllRecipes.initiate(null));
};

const loadMenus = async (store: ReturnType<typeof makeTestStore>) => {
    mockedGet.mockResolvedValue({ data: MENUS });
    await store.dispatch(menusApi.endpoints.getAllMenus.initiate(null));
};

describe("statisticsSelectors", () => {
    it("should aggregate recipe statistics from the cache", async () => {
        const store = makeTestStore();

        await loadRecipes(store);

        const result = selectRecipeStatistics(store.getState());

        expect(result.recipesCount).toBe(3);
        expect(result.stats).toEqual([
            { typeName: "Soup", count: 2 },
            { typeName: "Salad", count: 1 },
        ]);
        expect(result.mostUsedType).toEqual({ typeName: "Soup", count: 2 });
        expect(result.averageCookingTimeOverall).toBe("00:20");
        expect(result.averageCookingTimesByType).toEqual([
            { typeName: "Soup", averageCookingTime: "00:20" },
            { typeName: "Salad", averageCookingTime: "00:20" },
        ]);
        expect(result.fastestRecipes).toEqual([RECIPES[0]]);
        expect(result.slowestRecipes).toEqual([RECIPES[1]]);
        expect(result.mostIngredientsRecipes).toEqual([RECIPES[2]]);
        expect(result.leastIngredientsRecipes).toEqual([RECIPES[0]]);
    });

    it("should return empty recipe statistics when the cache is empty", () => {
        const result = selectRecipeStatistics(makeTestStore().getState());

        expect(result).toEqual({
            stats: [],
            recipesCount: 0,
            averageCookingTimeOverall: null,
            averageCookingTimesByType: [],
            mostUsedType: null,
            fastestRecipes: [],
            slowestRecipes: [],
            mostIngredientsRecipes: [],
            leastIngredientsRecipes: [],
        });
    });

    it("should aggregate menu statistics from the cache", async () => {
        const store = makeTestStore();

        await loadMenus(store);

        const result = selectMenuStatistics(store.getState());

        expect(result.menusCount).toBe(3);
        expect(result.menuCountByCategory).toEqual([
            { categoryname: "Lunch", menuCount: 2 },
            { categoryname: "Dinner", menuCount: 1 },
        ]);
        expect(result.mostUsedCategory).toEqual({
            categoryname: "Lunch",
            menuCount: 2,
        });
    });

    it("should return empty menu statistics when the cache is empty", () => {
        const result = selectMenuStatistics(makeTestStore().getState());

        expect(result).toEqual({
            menusCount: 0,
            menuCountByCategory: [],
            mostUsedCategory: null,
        });
    });
});
