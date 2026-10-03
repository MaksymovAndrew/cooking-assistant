import { act } from "@testing-library/react";

import { PAGE_SIZE } from "constants/pagination";
import type { CurrentUser } from "types/auth";
import type { Menu } from "types/menu";

import { API_ROUTES } from "api/endpoints";

import { authApi } from "redux/services/authApi";
import { menuCategoriesApi } from "redux/services/menuCategoriesApi";
import { menusApi } from "redux/services/menusApi";

import { MENU_SOURCE, useMenuListView } from "hooks/useMenuListView";

import {
    byOffset,
    makeAxiosError,
    mockedGet,
    mockGetByUrl,
} from "test/apiClientMock";
import { makeTestStore, renderHookWithRouter } from "test/store";

jest.mock("api/client");

const MENU_1: Menu = {
    id: 1,
    title: "Weekday menu",
    categoryName: "Lunch",
    menuContent: "quick",
    recipe_count: 2,
};
const MENU_2: Menu = {
    id: 2,
    title: "Weekend menu",
    categoryName: "Dinner",
    menuContent: "slow",
    recipe_count: 5,
};
const CURRENT_USER: CurrentUser = {
    id: 1,
    name: "Claude",
    surname: "Cook",
    login: "claude",
    created_at: "2025-06-15T00:00:00.000Z",
    email: "claude@example.com",
    email_verified_at: null,
    avatar: null,
    avatar_photo_key: null,
    calorie_goal: null,
    locale: "en",
};

// matches what the hook sends with no filters in the URL, so the pre-filled cache key lines up
const DEFAULT_PARAMS = {};

const FAILURE_MESSAGE = "Menus failed";
const FAILURE = makeAxiosError(500, FAILURE_MESSAGE);

// everything the list page loads besides the menus themselves
const BASE_GETS = {
    [API_ROUTES.auth.me]: CURRENT_USER,
    [API_ROUTES.menuCategories.list]: [],
};

const page = (items: Menu[], total = items.length) => ({ items, total });

const mockEmptyMenuList = () => {
    mockGetByUrl({ ...BASE_GETS, [API_ROUTES.menu.list]: page([]) });
};

// the base GETs, with the menu list answering per requested page
const mockMenuPages = (pageAt: (offset: number) => Promise<unknown>) => {
    mockGetByUrl(BASE_GETS);
    const loadByUrl = mockedGet.getMockImplementation();

    mockedGet.mockImplementation((url: string, config?: unknown) => {
        if (url === API_ROUTES.menu.list) {
            return pageAt(byOffset(config));
        }

        return loadByUrl ? loadByUrl(url) : Promise.reject(new Error(url));
    });
};

// the cache is filled before the hook mounts, so it reads finished data instead of racing promise ticks
const setup = async (
    source: (typeof MENU_SOURCE)[keyof typeof MENU_SOURCE] = MENU_SOURCE.all,
    initialEntries: string[] = ["/test"],
) => {
    const store = makeTestStore();
    const endpoint =
        source === MENU_SOURCE.person
            ? menusApi.endpoints.getMenusByPerson
            : menusApi.endpoints.getMenus;

    await Promise.all([
        store.dispatch(endpoint.initiate(DEFAULT_PARAMS)),
        store.dispatch(
            menuCategoriesApi.endpoints.getMenuCategories.initiate(null),
        ),
        store.dispatch(authApi.endpoints.getMe.initiate(null)),
    ]);

    return renderHookWithRouter(() => useMenuListView(source), {
        store,
        initialEntries,
    });
};

describe("useMenuListView", () => {
    it("should flatten the loaded page and report the total", async () => {
        mockGetByUrl({
            ...BASE_GETS,
            [API_ROUTES.menu.list]: page([MENU_1, MENU_2]),
        });

        const { result } = await setup();

        expect(result.current.menus).toEqual([MENU_1, MENU_2]);
        expect(result.current.total).toBe(2);
        expect(result.current.loadedCount).toBe(2);
        expect(result.current.hasNextPage).toBe(false);
        expect(result.current.noMenus).toBe(false);
    });

    it("should report noMenus once loading succeeds with zero results", async () => {
        mockEmptyMenuList();

        const { result } = await setup();

        expect(result.current.noMenus).toBe(true);
        expect(result.current.menus).toEqual([]);
    });

    it("should request the current user's menus when the source is person", async () => {
        mockGetByUrl({
            ...BASE_GETS,
            [API_ROUTES.menu.byPerson]: page([MENU_1]),
        });

        const { result } = await setup(MENU_SOURCE.person);

        expect(result.current.menus).toEqual([MENU_1]);
        expect(mockedGet).toHaveBeenCalledWith(
            API_ROUTES.menu.byPerson,
            expect.anything(),
        );
    });

    it("should fetch the next page and append it without dropping earlier rows", async () => {
        mockMenuPages((offset) =>
            Promise.resolve({
                data: page(offset === 0 ? [MENU_1] : [MENU_2], 2),
            }),
        );

        const { result } = await setup();

        expect(result.current.menus).toEqual([MENU_1]);
        expect(result.current.hasNextPage).toBe(true);

        await act(async () => {
            await result.current.fetchNextPage();
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.menus).toEqual([MENU_1, MENU_2]);
        expect(result.current.hasNextPage).toBe(false);
    });

    it("should surface a first-page failure as error with no menus loaded", async () => {
        const store = makeTestStore();

        mockMenuPages(() => Promise.reject(FAILURE));

        await Promise.all([
            store.dispatch(
                menusApi.endpoints.getMenus.initiate(DEFAULT_PARAMS),
            ),
            store.dispatch(
                menuCategoriesApi.endpoints.getMenuCategories.initiate(null),
            ),
        ]);

        const { result } = renderHookWithRouter(
            () => useMenuListView(MENU_SOURCE.all),
            { store },
        );

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.error).toBe(FAILURE_MESSAGE);
        expect(result.current.loadMoreError).toBeNull();
        expect(result.current.menus).toEqual([]);
    });

    it("should keep loaded menus and report loadMoreError when the next page fails", async () => {
        mockMenuPages((offset) =>
            offset === 0
                ? Promise.resolve({ data: page([MENU_1], 2) })
                : Promise.reject(FAILURE),
        );

        const { result } = await setup();

        await act(async () => {
            await result.current.fetchNextPage();
        });

        expect(result.current.menus).toEqual([MENU_1]);
        expect(result.current.loadMoreError).toBe(FAILURE_MESSAGE);
        expect(result.current.error).toBeNull();
    });

    it("should send the name search as menu_name and the categories as category_ids", async () => {
        mockEmptyMenuList();

        await setup(MENU_SOURCE.all, ["/test?q=brunch&cats=1,2"]);

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.menu.list, {
            params: {
                menu_name: "brunch",
                category_ids: "1,2",
                limit: PAGE_SIZE,
                offset: 0,
            },
        });
    });

    it("should send the top-rated filter and the rating sort", async () => {
        mockEmptyMenuList();

        await setup(MENU_SOURCE.all, ["/test?top=1&sort=rating"]);

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.menu.list, {
            params: {
                top_rated: true,
                sort_order: "rating",
                limit: PAGE_SIZE,
                offset: 0,
            },
        });
    });

    it("should hold back a favourites request while the session check is still pending", async () => {
        mockEmptyMenuList();

        renderHookWithRouter(() => useMenuListView(MENU_SOURCE.all), {
            initialEntries: ["/test?fav=1"],
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(mockedGet).not.toHaveBeenCalledWith(
            API_ROUTES.menu.list,
            expect.anything(),
        );
    });

    it("should drop the favourites filter for a guest instead of sending it", async () => {
        mockEmptyMenuList();

        renderHookWithRouter(() => useMenuListView(MENU_SOURCE.all), {
            store: makeTestStore({ session: { status: "guest" } }),
            initialEntries: ["/test?fav=1"],
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.menu.list, {
            params: { limit: PAGE_SIZE, offset: 0 },
        });
    });
});
