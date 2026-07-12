import { act } from "@testing-library/react";
import type * as ReactRouterDom from "react-router-dom";

import type { CurrentUser } from "types/auth";
import type { RecipeListItem } from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import { authApi } from "redux/services/authApi";
import { recipesApi } from "redux/services/recipesApi";
import { recipeTypesApi } from "redux/services/recipeTypesApi";

import { RECIPE_SOURCE, useRecipeListView } from "hooks/useRecipeListView";

import { buildRecipeFilterParams } from "utils/recipeFilterParams";

import { byOffset, makeAxiosError, mockedGet } from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual<typeof ReactRouterDom>("react-router-dom"),
    useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));
jest.mock("api/client");

const RECIPE_DATE = "2024-01-01";

const RECIPE_1: RecipeListItem = {
    id: 5,
    title: "Borscht",
    type_name: "Soup",
    creation_date: RECIPE_DATE,
    cooking_time: 60,
};
const RECIPE_2: RecipeListItem = {
    id: 2,
    title: "Varenyky",
    type_name: "Main",
    creation_date: "2024-01-02",
    cooking_time: 45,
};
const CURRENT_USER: CurrentUser = {
    id: 1,
    name: "Claude",
    surname: "Cook",
    login: "claude",
    created_at: "2025-06-15T00:00:00.000Z",
};

// matches the default filters slice state + no URL ingredient search, so the pre-seeded cache key lines up with what the hook itself requests
const DEFAULT_PARAMS = buildRecipeFilterParams(
    {
        selectedTypes: [],
        startDate: "",
        endDate: "",
        minCookingTime: "",
        maxCookingTime: "",
        sortOrder: "asc",
    },
    null,
);

const FAILURE_MESSAGE = "Recipes failed";
const FAILURE = makeAxiosError(500, FAILURE_MESSAGE);

// pre-seed the cache by awaiting the real query thunks before the hook mounts, so the hook reads already-fulfilled data on first render instead of racing a guessed number of promise ticks
const setup = async (
    source: (typeof RECIPE_SOURCE)[keyof typeof RECIPE_SOURCE] = RECIPE_SOURCE.all,
) => {
    const store = makeTestStore();
    const endpoint =
        source === RECIPE_SOURCE.person
            ? recipesApi.endpoints.getRecipesByPerson
            : recipesApi.endpoints.getRecipesByFilters;

    await Promise.all([
        store.dispatch(endpoint.initiate(DEFAULT_PARAMS)),
        store.dispatch(recipeTypesApi.endpoints.getRecipeTypes.initiate(null)),
        store.dispatch(authApi.endpoints.getMe.initiate(null)),
    ]);

    return renderHookWithStore(() => useRecipeListView(source), store);
};

describe("useRecipeListView", () => {
    it("should flatten the loaded page, report the total and keep the server order", async () => {
        mockedGet.mockImplementation((url: string) => {
            if (url === API_ROUTES.auth.me) {
                return Promise.resolve({ data: CURRENT_USER });
            }
            if (url === API_ROUTES.recipeTypes.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.recipes.byFilters) {
                return Promise.resolve({
                    data: { items: [RECIPE_1, RECIPE_2], total: 2 },
                });
            }

            return Promise.reject(new Error(`unexpected GET ${url}`));
        });

        const { result } = await setup();

        expect(result.current.recipes).toEqual([RECIPE_1, RECIPE_2]);
        expect(result.current.total).toBe(2);
        expect(result.current.loadedCount).toBe(2);
        expect(result.current.hasNextPage).toBe(false);
        expect(result.current.noRecipes).toBe(false);
    });

    it("should expose the current user's id, for per-item ownership checks in the all-recipes view", async () => {
        mockedGet.mockImplementation((url: string) => {
            if (url === API_ROUTES.auth.me) {
                return Promise.resolve({ data: CURRENT_USER });
            }
            if (url === API_ROUTES.recipeTypes.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.recipes.byFilters) {
                return Promise.resolve({ data: { items: [], total: 0 } });
            }

            return Promise.reject(new Error(`unexpected GET ${url}`));
        });

        const { result } = await setup();

        expect(result.current.currentUserId).toBe(CURRENT_USER.id);
    });

    it("should report noRecipes once loading succeeds with zero results", async () => {
        mockedGet.mockImplementation((url: string) => {
            if (url === API_ROUTES.auth.me) {
                return Promise.resolve({ data: CURRENT_USER });
            }
            if (url === API_ROUTES.recipeTypes.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.recipes.byFilters) {
                return Promise.resolve({ data: { items: [], total: 0 } });
            }

            return Promise.reject(new Error(`unexpected GET ${url}`));
        });

        const { result } = await setup();

        expect(result.current.noRecipes).toBe(true);
        expect(result.current.recipes).toEqual([]);
    });

    it("should request the current user's recipes when the source is person", async () => {
        mockedGet.mockImplementation((url: string) => {
            if (url === API_ROUTES.auth.me) {
                return Promise.resolve({ data: CURRENT_USER });
            }
            if (url === API_ROUTES.recipeTypes.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.recipes.byPerson) {
                return Promise.resolve({
                    data: { items: [RECIPE_1], total: 1 },
                });
            }

            return Promise.reject(new Error(`unexpected GET ${url}`));
        });

        const { result } = await setup(RECIPE_SOURCE.person);

        expect(result.current.recipes).toEqual([RECIPE_1]);
        expect(mockedGet).toHaveBeenCalledWith(
            API_ROUTES.recipes.byPerson,
            expect.anything(),
        );
    });

    it("should fetch the next page and append it without dropping earlier rows", async () => {
        mockedGet.mockImplementation((url: string, config?: unknown) => {
            if (url === API_ROUTES.auth.me) {
                return Promise.resolve({ data: CURRENT_USER });
            }
            if (url === API_ROUTES.recipeTypes.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.recipes.byFilters) {
                return Promise.resolve({
                    data:
                        byOffset(config) === 0
                            ? { items: [RECIPE_1], total: 2 }
                            : { items: [RECIPE_2], total: 2 },
                });
            }

            return Promise.reject(new Error(`unexpected GET ${url}`));
        });

        const { result } = await setup();

        expect(result.current.recipes).toEqual([RECIPE_1]);
        expect(result.current.hasNextPage).toBe(true);

        await act(async () => {
            await result.current.fetchNextPage();
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.recipes).toEqual([RECIPE_1, RECIPE_2]);
        expect(result.current.hasNextPage).toBe(false);
    });

    it("should surface a first-page failure as error with no recipes loaded", async () => {
        const store = makeTestStore();

        mockedGet.mockImplementation((url: string) => {
            if (url === API_ROUTES.auth.me) {
                return Promise.resolve({ data: CURRENT_USER });
            }
            if (url === API_ROUTES.recipeTypes.list) {
                return Promise.resolve({ data: [] });
            }

            return Promise.reject(FAILURE);
        });

        await Promise.all([
            store.dispatch(
                recipesApi.endpoints.getRecipesByFilters.initiate(
                    DEFAULT_PARAMS,
                ),
            ),
            store.dispatch(
                recipeTypesApi.endpoints.getRecipeTypes.initiate(null),
            ),
        ]);

        const { result } = renderHookWithStore(
            () => useRecipeListView(RECIPE_SOURCE.all),
            store,
        );

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.error).toBe(FAILURE_MESSAGE);
        expect(result.current.loadMoreError).toBeNull();
        expect(result.current.recipes).toEqual([]);
    });

    it("should keep loaded recipes and report loadMoreError when the next page fails", async () => {
        mockedGet.mockImplementation((url: string, config?: unknown) => {
            if (url === API_ROUTES.auth.me) {
                return Promise.resolve({ data: CURRENT_USER });
            }
            if (url === API_ROUTES.recipeTypes.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.recipes.byFilters) {
                if (byOffset(config) === 0) {
                    return Promise.resolve({
                        data: { items: [RECIPE_1], total: 2 },
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

        expect(result.current.recipes).toEqual([RECIPE_1]);
        expect(result.current.loadMoreError).toBe(FAILURE_MESSAGE);
        expect(result.current.error).toBeNull();
    });

    it("should dispatch filter changes through the store setters", async () => {
        mockedGet.mockImplementation((url: string) => {
            if (url === API_ROUTES.auth.me) {
                return Promise.resolve({ data: CURRENT_USER });
            }
            if (url === API_ROUTES.recipeTypes.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.recipes.byFilters) {
                return Promise.resolve({ data: { items: [], total: 0 } });
            }

            return Promise.reject(new Error(`unexpected GET ${url}`));
        });

        const { result } = await setup();

        act(() => {
            result.current.setSelectedTypes([1]);
            result.current.setStartDate(RECIPE_DATE);
            result.current.setEndDate("2024-01-31");
            result.current.setMinCookingTime("10");
            result.current.setMaxCookingTime("60");
            result.current.setSortOrder("desc");
        });

        expect(result.current.filters).toMatchObject({
            selectedTypes: [1],
            startDate: RECIPE_DATE,
            endDate: "2024-01-31",
            minCookingTime: "10",
            maxCookingTime: "60",
            sortOrder: "desc",
        });
    });
});
