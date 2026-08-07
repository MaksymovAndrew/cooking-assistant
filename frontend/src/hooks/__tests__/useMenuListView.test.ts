import { act } from "@testing-library/react";

import { PAGE_SIZE } from "constants/pagination";
import type { CurrentUser } from "types/auth";
import type { Menu } from "types/menu";

import { API_ROUTES } from "api/endpoints";

import { authApi } from "redux/services/authApi";
import { menuCategoriesApi } from "redux/services/menuCategoriesApi";
import { menusApi } from "redux/services/menusApi";

import { MENU_SOURCE, useMenuListView } from "hooks/useMenuListView";

import { byOffset, makeAxiosError, mockedGet } from "test/apiClientMock";
import { makeTestStore, renderHookWithRouter } from "test/store";

jest.mock("api/client");

const MENU_1: Menu = {
    id: 1,
    title: "Weekday menu",
    categoryname: "Lunch",
    menucontent: "quick",
    recipe_count: 2,
};
const MENU_2: Menu = {
    id: 2,
    title: "Weekend menu",
    categoryname: "Dinner",
    menucontent: "slow",
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
    calorie_goal: null,
};

// matches what the hook sends with no filters active in the URL, so the pre-seeded cache key lines up with what the hook itself requests
const DEFAULT_PARAMS = {};

const FAILURE_MESSAGE = "Menus failed";
const FAILURE = makeAxiosError(500, FAILURE_MESSAGE);

const mockEmptyMenuList = () => {
    mockedGet.mockImplementation((url: string) => {
        if (url === API_ROUTES.auth.me) {
            return Promise.resolve({ data: CURRENT_USER });
        }
        if (url === API_ROUTES.menuCategories.list) {
            return Promise.resolve({ data: [] });
        }
        if (url === API_ROUTES.menu.list) {
            return Promise.resolve({ data: { items: [], total: 0 } });
        }

        return Promise.reject(new Error(`unexpected GET ${url}`));
    });
};

// pre-seed the cache by awaiting the real query thunks before the hook mounts, so the hook reads already-fulfilled data on first render instead of racing a guessed number of promise ticks
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
        mockedGet.mockImplementation((url: string) => {
            if (url === API_ROUTES.auth.me) {
                return Promise.resolve({ data: CURRENT_USER });
            }
            if (url === API_ROUTES.menuCategories.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.menu.list) {
                return Promise.resolve({
                    data: { items: [MENU_1, MENU_2], total: 2 },
                });
            }

            return Promise.reject(new Error(`unexpected GET ${url}`));
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
        mockedGet.mockImplementation((url: string) => {
            if (url === API_ROUTES.auth.me) {
                return Promise.resolve({ data: CURRENT_USER });
            }
            if (url === API_ROUTES.menuCategories.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.menu.byPerson) {
                return Promise.resolve({
                    data: { items: [MENU_1], total: 1 },
                });
            }

            return Promise.reject(new Error(`unexpected GET ${url}`));
        });

        const { result } = await setup(MENU_SOURCE.person);

        expect(result.current.menus).toEqual([MENU_1]);
        expect(mockedGet).toHaveBeenCalledWith(
            API_ROUTES.menu.byPerson,
            expect.anything(),
        );
    });

    it("should fetch the next page and append it without dropping earlier rows", async () => {
        mockedGet.mockImplementation((url: string, config?: unknown) => {
            if (url === API_ROUTES.auth.me) {
                return Promise.resolve({ data: CURRENT_USER });
            }
            if (url === API_ROUTES.menuCategories.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.menu.list) {
                return Promise.resolve({
                    data:
                        byOffset(config) === 0
                            ? { items: [MENU_1], total: 2 }
                            : { items: [MENU_2], total: 2 },
                });
            }

            return Promise.reject(new Error(`unexpected GET ${url}`));
        });

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

        mockedGet.mockImplementation((url: string) => {
            if (url === API_ROUTES.auth.me) {
                return Promise.resolve({ data: CURRENT_USER });
            }
            if (url === API_ROUTES.menuCategories.list) {
                return Promise.resolve({ data: [] });
            }

            return Promise.reject(FAILURE);
        });

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
        mockedGet.mockImplementation((url: string, config?: unknown) => {
            if (url === API_ROUTES.auth.me) {
                return Promise.resolve({ data: CURRENT_USER });
            }
            if (url === API_ROUTES.menuCategories.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.menu.list) {
                if (byOffset(config) === 0) {
                    return Promise.resolve({
                        data: { items: [MENU_1], total: 2 },
                    });
                }

                return Promise.reject(FAILURE);
            }

            return Promise.reject(new Error(`unexpected GET ${url}`));
        });

        const { result } = await setup();

        await act(async () => {
            await result.current.fetchNextPage();
        });

        expect(result.current.menus).toEqual([MENU_1]);
        expect(result.current.loadMoreError).toBe(FAILURE_MESSAGE);
        expect(result.current.error).toBeNull();
    });

    it("should write the selected categories into the URL-backed filter state", async () => {
        mockEmptyMenuList();

        const { result } = await setup();

        act(() => {
            result.current.setValue("categories", [3]);
        });

        expect(result.current.filters.categories).toEqual([3]);
    });

    it("should report hasActiveFilters once a category is selected", async () => {
        mockEmptyMenuList();

        const { result } = await setup();

        expect(result.current.hasActiveFilters).toBe(false);

        act(() => {
            result.current.setValue("categories", [3]);
        });

        expect(result.current.hasActiveFilters).toBe(true);
    });

    it("should reset every filter back to its default when resetFilters is called", async () => {
        mockEmptyMenuList();

        const { result } = await setup();

        act(() => {
            result.current.setValue("categories", [3]);
        });
        act(() => {
            result.current.resetFilters();
        });

        expect(result.current.filters).toEqual({ search: "", categories: [] });
    });

    it("should read the name search and selected categories from the URL", async () => {
        mockEmptyMenuList();

        const { result } = await setup(MENU_SOURCE.all, [
            "/test?q=brunch&cats=1,2",
        ]);

        expect(result.current.filters).toEqual({
            search: "brunch",
            categories: [1, 2],
        });
        expect(result.current.activeCount).toBe(2);
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
});
