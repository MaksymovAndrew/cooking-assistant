import { act } from "@testing-library/react";
import type * as ReactRouterDom from "react-router-dom";

import type { CurrentUser } from "types/auth";
import type { Menu } from "types/menu";

import { API_ROUTES } from "api/endpoints";

import { authApi } from "redux/services/authApi";
import { menuCategoriesApi } from "redux/services/menuCategoriesApi";
import { menusApi } from "redux/services/menusApi";

import { MENU_SOURCE, useMenuListView } from "hooks/useMenuListView";

import { buildMenuFilterParams } from "utils/menuFilterParams";

import { byOffset, makeAxiosError, mockedGet } from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual<typeof ReactRouterDom>("react-router-dom"),
    useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));
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
};

// matches the default filters slice state + no URL name search, so the pre-seeded cache key lines up with what the hook itself requests
const DEFAULT_PARAMS = buildMenuFilterParams([], null);

const FAILURE_MESSAGE = "Menus failed";
const FAILURE = makeAxiosError(500, FAILURE_MESSAGE);

// pre-seed the cache by awaiting the real query thunks before the hook mounts, so the hook reads already-fulfilled data on first render instead of racing a guessed number of promise ticks
const setup = async (
    source: (typeof MENU_SOURCE)[keyof typeof MENU_SOURCE] = MENU_SOURCE.all,
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

    return renderHookWithStore(() => useMenuListView(source), store);
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

    it("should expose the current user's id, for per-item ownership checks in the all-menus view", async () => {
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

        const { result } = await setup();

        expect(result.current.currentUserId).toBe(CURRENT_USER.id);
    });

    it("should report noMenus once loading succeeds with zero results", async () => {
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

        const { result } = renderHookWithStore(
            () => useMenuListView(MENU_SOURCE.all),
            store,
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

    it("should dispatch the selected categories through the store setter", async () => {
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

        const { result } = await setup();

        act(() => {
            result.current.setSelectedCategories([3]);
        });

        expect(result.current.selectedCategories).toEqual([3]);
    });

    it("should report hasActiveFilters once a category is selected", async () => {
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

        const { result } = await setup();

        expect(result.current.hasActiveFilters).toBe(false);

        act(() => {
            result.current.setSelectedCategories([3]);
        });

        expect(result.current.hasActiveFilters).toBe(true);
    });

    it("should reset the selected categories when clearFilters is called", async () => {
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

        const { result } = await setup();

        act(() => {
            result.current.setSelectedCategories([3]);
        });
        act(() => {
            result.current.clearFilters();
        });

        expect(result.current.selectedCategories).toEqual([]);
    });
});
