import { PAGE_SIZE } from "constants/pagination";
import type { Menu, MenuListParams } from "types/menu";

import { API_ROUTES } from "api/endpoints";

import { caloriesApi } from "redux/services/caloriesApi";
import { menusApi } from "redux/services/menusApi";

import { mockedDelete, mockedGet } from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const LIST: Menu[] = [
    {
        id: 1,
        title: "Week",
        categoryName: "Weekly",
        menuContent: "x",
        recipe_count: 3,
    },
];
const PAGE = { items: LIST, total: LIST.length };
const PARAMS: MenuListParams = { menu_name: "Week" };

describe("menusApi", () => {
    it("should fetch menus by filters", async () => {
        mockedGet.mockResolvedValue({ data: PAGE });
        const store = makeTestStore();

        const result = await store.dispatch(
            menusApi.endpoints.getMenus.initiate(PARAMS),
        );

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.menu.list, {
            params: { ...PARAMS, limit: PAGE_SIZE, offset: 0 },
        });
        expect(result.data).toEqual({ pages: [PAGE], pageParams: [0] });
    });

    it("should invalidate the cached calorie intake log after deleting a menu, since the backend cascades the delete into logged entries", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        mockedGet.mockResolvedValue({ data: [] });
        const store = makeTestStore();
        const range = {
            from: "2026-01-01T00:00:00.000Z",
            to: "2026-01-01T23:59:59.999Z",
        };

        await store.dispatch(
            caloriesApi.endpoints.getCalorieIntake.initiate(range),
        );
        const callsAfterFirstFetch = mockedGet.mock.calls.length;

        await store.dispatch(menusApi.endpoints.deleteMenu.initiate(1));
        await store.dispatch(
            caloriesApi.endpoints.getCalorieIntake.initiate(range),
        );

        expect(mockedGet.mock.calls.length).toBeGreaterThan(
            callsAfterFirstFetch,
        );
    });
});
