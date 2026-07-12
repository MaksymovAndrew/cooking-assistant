import type { MenuWithStats } from "types/menu";
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

const MENUS: MenuWithStats[] = [
    {
        id: 1,
        title: "M1",
        categoryname: "Lunch",
        menucontent: "",
        recipe_count: 2,
        total_cooking_time: 40,
    },
    {
        id: 2,
        title: "M2",
        categoryname: "Lunch",
        menucontent: "",
        recipe_count: 4,
        total_cooking_time: 80,
    },
    {
        id: 3,
        title: "M3",
        categoryname: "Dinner",
        menucontent: "",
        recipe_count: 1,
        total_cooking_time: 20,
    },
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
        expect(result.averageCookingTimeOverall).toBe(20);
        expect(result.averageCookingTimesByType).toEqual([
            { typeName: "Soup", averageCookingTime: 20 },
            { typeName: "Salad", averageCookingTime: 20 },
        ]);
        expect(result.fastestRecipes).toEqual([
            RECIPES[0],
            RECIPES[2],
            RECIPES[1],
        ]);
        expect(result.slowestRecipes).toEqual([
            RECIPES[1],
            RECIPES[2],
            RECIPES[0],
        ]);
        expect(result.mostIngredientsRecipes).toEqual([
            RECIPES[2],
            RECIPES[1],
            RECIPES[0],
        ]);
        expect(result.leastIngredientsRecipes).toEqual([
            RECIPES[0],
            RECIPES[1],
            RECIPES[2],
        ]);
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
        expect(result.averageTotalTime).toBe(47);
        expect(result.averageRecipesPerMenu).toBeCloseTo(2.33, 2);
        expect(result.averageTotalTimeByCategory).toEqual([
            { categoryname: "Lunch", averageTotalTime: 60 },
            { categoryname: "Dinner", averageTotalTime: 20 },
        ]);
        expect(result.fastestMenus).toEqual([MENUS[2], MENUS[0], MENUS[1]]);
        expect(result.slowestMenus).toEqual([MENUS[1], MENUS[0], MENUS[2]]);
        expect(result.mostRecipesMenus).toEqual([MENUS[1], MENUS[0], MENUS[2]]);
        expect(result.leastRecipesMenus).toEqual([
            MENUS[2],
            MENUS[0],
            MENUS[1],
        ]);
    });

    it("should return empty menu statistics when the cache is empty", () => {
        const result = selectMenuStatistics(makeTestStore().getState());

        expect(result).toEqual({
            menusCount: 0,
            menuCountByCategory: [],
            mostUsedCategory: null,
            averageTotalTime: null,
            averageRecipesPerMenu: null,
            averageTotalTimeByCategory: [],
            fastestMenus: [],
            slowestMenus: [],
            mostRecipesMenus: [],
            leastRecipesMenus: [],
        });
    });
});
