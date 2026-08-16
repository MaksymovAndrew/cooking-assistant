import type { MenuWithStats } from "types/menu";

import { selectMenuStatistics } from "redux/selectors/statisticsSelectors";
import { menusApi } from "redux/services/menusApi";

import { mockedGet } from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const MENUS: MenuWithStats[] = [
    {
        id: 1,
        title: "M1",
        categoryname: "Lunch",
        menucontent: "",
        recipe_count: 2,
        total_cooking_time: 40,
        total_calories: 500,
    },
    {
        id: 2,
        title: "M2",
        categoryname: "Lunch",
        menucontent: "",
        recipe_count: 4,
        total_cooking_time: 80,
        total_calories: 1500,
    },
    {
        id: 3,
        title: "M3",
        categoryname: "Dinner",
        menucontent: "",
        recipe_count: 1,
        total_cooking_time: 20,
        // one recipe on this menu has no calorie data - the whole menu reads as unknown, not undercounted
        total_calories: null,
    },
];

const loadMenus = async (store: ReturnType<typeof makeTestStore>) => {
    mockedGet.mockResolvedValue({ data: MENUS });
    await store.dispatch(menusApi.endpoints.getAllMenus.initiate(null));
};

describe("statisticsSelectors", () => {
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
        // M3 is excluded from every calorie figure - it has no calorie data
        expect(result.averageCaloriesOverall).toBe(1000);
        expect(result.mostCaloricMenus).toEqual([MENUS[1], MENUS[0]]);
        expect(result.leastCaloricMenus).toEqual([MENUS[0], MENUS[1]]);
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
            averageCaloriesOverall: null,
            mostCaloricMenus: [],
            leastCaloricMenus: [],
        });
    });
});
