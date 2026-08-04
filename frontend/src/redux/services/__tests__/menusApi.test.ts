import { PAGE_SIZE } from "constants/pagination";
import type {
    CreateMenuRequest,
    Menu,
    MenuDetails,
    MenuListParams,
    UpdateMenuRequest,
} from "types/menu";

import { API_ROUTES } from "api/endpoints";

import { caloriesApi } from "redux/services/caloriesApi";
import { menusApi } from "redux/services/menusApi";

import {
    mockedDelete,
    mockedGet,
    mockedPost,
    mockedPut,
} from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const LIST: Menu[] = [
    {
        id: 1,
        title: "Week",
        categoryname: "Weekly",
        menucontent: "x",
        recipe_count: 3,
    },
];
const PAGE = { items: LIST, total: LIST.length };
const PARAMS: MenuListParams = { menu_name: "Week" };
const DETAIL: MenuDetails = {
    menu: {
        id: 1,
        title: "Week",
        categoryname: "Weekly",
        menucontent: "x",
        category_id: 2,
        isOwner: true,
    },
    recipes: [],
    allergens: [],
};
const CREATE: CreateMenuRequest = {
    menuTitle: "Week",
    menuContent: "x",
    categoryId: 2,
    recipeIds: [1, 2],
};
const UPDATE: UpdateMenuRequest = {
    menuTitle: "Week",
    menuContent: "x",
    categoryId: 2,
    recipeIds: [1, 2],
};

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

    it("should fetch the current user's menus", async () => {
        mockedGet.mockResolvedValue({ data: PAGE });
        const store = makeTestStore();

        await store.dispatch(
            menusApi.endpoints.getMenusByPerson.initiate(PARAMS),
        );

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.menu.byPerson, {
            params: { ...PARAMS, limit: PAGE_SIZE, offset: 0 },
        });
    });

    it("should fetch all menus for statistics", async () => {
        mockedGet.mockResolvedValue({ data: LIST });
        const store = makeTestStore();

        const result = await store.dispatch(
            menusApi.endpoints.getAllMenus.initiate(null),
        );

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.menu.allUnpaginated, {
            params: undefined,
        });
        expect(result.data).toEqual(LIST);
    });

    it("should fetch a menu by id", async () => {
        mockedGet.mockResolvedValue({ data: DETAIL });
        const store = makeTestStore();

        const result = await store.dispatch(
            menusApi.endpoints.getMenuById.initiate(1),
        );

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.menu.byId(1), {
            params: undefined,
        });
        expect(result.data).toEqual(DETAIL);
    });

    it("should create a menu", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(menusApi.endpoints.createMenu.initiate(CREATE));

        expect(mockedPost).toHaveBeenCalledWith(API_ROUTES.menu.create, CREATE);
    });

    it("should update a menu", async () => {
        mockedPut.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            menusApi.endpoints.updateMenu.initiate({ id: 1, data: UPDATE }),
        );

        expect(mockedPut).toHaveBeenCalledWith(API_ROUTES.menu.byId(1), UPDATE);
    });

    it("should delete a menu", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(menusApi.endpoints.deleteMenu.initiate(1));

        expect(mockedDelete).toHaveBeenCalledWith(API_ROUTES.menu.byId(1), {
            params: undefined,
        });
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
