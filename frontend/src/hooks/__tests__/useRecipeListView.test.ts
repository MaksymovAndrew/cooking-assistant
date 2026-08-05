import { act } from "@testing-library/react";

import { PAGE_SIZE } from "constants/pagination";
import type { CurrentUser } from "types/auth";
import type { Ingredient } from "types/ingredient";
import type { RecipeListItem } from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import { authApi } from "redux/services/authApi";
import { caloriesApi } from "redux/services/caloriesApi";
import { ingredientsApi } from "redux/services/ingredientsApi";
import { recipesApi } from "redux/services/recipesApi";
import { recipeTypesApi } from "redux/services/recipeTypesApi";

import { RECIPE_SOURCE, useRecipeListView } from "hooks/useRecipeListView";

import { getTodayRange } from "utils/calorieDateRange";

import { byOffset, makeAxiosError, mockedGet } from "test/apiClientMock";
import { makeTestStore, renderHookWithRouter } from "test/store";

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
    email: "claude@example.com",
    email_verified_at: null,
    avatar: null,
    calorie_goal: null,
};
const MILK: Ingredient = {
    id: 3,
    slug: "milk",
    name: "Milk",
    category: "dairy",
    unit_name: "ml",
    allergens: ["milk"],
    days_to_expire: 7,
    calories_per_unit: null,
};

// matches what the hook sends with no filters active in the URL: sort_order is
// omitted (server default: newest first), same for every other filter
const DEFAULT_PARAMS = {};

const FAILURE_MESSAGE = "Recipes failed";
const FAILURE = makeAxiosError(500, FAILURE_MESSAGE);

// pre-seed the cache by awaiting the real query thunks before the hook mounts, so the hook reads already-fulfilled data on first render instead of racing a guessed number of promise ticks
const setup = async (
    source: (typeof RECIPE_SOURCE)[keyof typeof RECIPE_SOURCE] = RECIPE_SOURCE.all,
    initialEntries: string[] = ["/test"],
    params = DEFAULT_PARAMS,
) => {
    const store = makeTestStore();
    const endpoint =
        source === RECIPE_SOURCE.person
            ? recipesApi.endpoints.getRecipesByPerson
            : recipesApi.endpoints.getRecipesByFilters;

    await Promise.all([
        store.dispatch(endpoint.initiate(params)),
        store.dispatch(recipeTypesApi.endpoints.getRecipeTypes.initiate(null)),
        store.dispatch(authApi.endpoints.getMe.initiate(null)),
    ]);

    return renderHookWithRouter(() => useRecipeListView(source), {
        store,
        initialEntries,
    });
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
            if (url === API_ROUTES.ingredients.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.userIngredients.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.calories.intake) {
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

    it("should expose the calorie goal and today's remaining budget, computed once for the whole list", async () => {
        // fixed "now" so the range this test pre-dispatches exactly matches what the hook computes itself
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 0, 14, 15, 30));

        try {
            mockedGet.mockImplementation((url: string) => {
                if (url === API_ROUTES.auth.me) {
                    return Promise.resolve({
                        data: { ...CURRENT_USER, calorie_goal: 2000 },
                    });
                }
                if (url === API_ROUTES.recipeTypes.list) {
                    return Promise.resolve({ data: [] });
                }
                if (url === API_ROUTES.ingredients.list) {
                    return Promise.resolve({ data: [] });
                }
                if (url === API_ROUTES.userIngredients.list) {
                    return Promise.resolve({ data: [] });
                }
                if (url === API_ROUTES.calories.intake) {
                    return Promise.resolve({ data: [{ calories: 300 }] });
                }
                if (url === API_ROUTES.recipes.byFilters) {
                    return Promise.resolve({ data: { items: [], total: 0 } });
                }

                return Promise.reject(new Error(`unexpected GET ${url}`));
            });

            const store = makeTestStore();

            await Promise.all([
                store.dispatch(
                    recipesApi.endpoints.getRecipesByFilters.initiate(
                        DEFAULT_PARAMS,
                    ),
                ),
                store.dispatch(
                    recipeTypesApi.endpoints.getRecipeTypes.initiate(null),
                ),
                store.dispatch(authApi.endpoints.getMe.initiate(null)),
                store.dispatch(
                    caloriesApi.endpoints.getCalorieIntake.initiate(
                        getTodayRange(),
                    ),
                ),
            ]);

            const { result } = renderHookWithRouter(
                () => useRecipeListView(RECIPE_SOURCE.all),
                { store },
            );

            expect(result.current.calorieGoal).toBe(2000);
            expect(result.current.calorieRemaining).toBe(1700);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should report noRecipes once loading succeeds with zero results", async () => {
        mockedGet.mockImplementation((url: string) => {
            if (url === API_ROUTES.auth.me) {
                return Promise.resolve({ data: CURRENT_USER });
            }
            if (url === API_ROUTES.recipeTypes.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.ingredients.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.userIngredients.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.calories.intake) {
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
            if (url === API_ROUTES.ingredients.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.userIngredients.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.calories.intake) {
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
            if (url === API_ROUTES.ingredients.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.userIngredients.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.calories.intake) {
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
            if (url === API_ROUTES.ingredients.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.userIngredients.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.calories.intake) {
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

        const { result } = renderHookWithRouter(
            () => useRecipeListView(RECIPE_SOURCE.all),
            { store },
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
            if (url === API_ROUTES.ingredients.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.userIngredients.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.calories.intake) {
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

    it("should update the URL-backed filters when setValue is called", async () => {
        mockedGet.mockImplementation((url: string) => {
            if (url === API_ROUTES.auth.me) {
                return Promise.resolve({ data: CURRENT_USER });
            }
            if (url === API_ROUTES.recipeTypes.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.ingredients.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.userIngredients.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.calories.intake) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.recipes.byFilters) {
                return Promise.resolve({ data: { items: [], total: 0 } });
            }

            return Promise.reject(new Error(`unexpected GET ${url}`));
        });

        const { result } = await setup();

        act(() => {
            result.current.setValue("types", [1]);
        });
        act(() => {
            result.current.setValue("cookingTime", { min: "10", max: "60" });
        });
        act(() => {
            result.current.setValue("sort", "desc");
        });

        expect(result.current.filters).toMatchObject({
            types: [1],
            cookingTime: { min: "10", max: "60" },
            sort: "desc",
        });
    });

    it("should send the search text as recipe_name in the request", async () => {
        mockedGet.mockImplementation((url: string) => {
            if (url === API_ROUTES.auth.me) {
                return Promise.resolve({ data: CURRENT_USER });
            }
            if (url === API_ROUTES.recipeTypes.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.ingredients.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.userIngredients.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.calories.intake) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.recipes.byFilters) {
                return Promise.resolve({
                    data: { items: [RECIPE_1], total: 1 },
                });
            }

            return Promise.reject(new Error(`unexpected GET ${url}`));
        });

        const store = makeTestStore();
        const paramsWithSearch = { recipe_name: "Borscht" };

        await Promise.all([
            store.dispatch(
                recipesApi.endpoints.getRecipesByFilters.initiate(
                    paramsWithSearch,
                ),
            ),
            store.dispatch(
                recipeTypesApi.endpoints.getRecipeTypes.initiate(null),
            ),
            store.dispatch(authApi.endpoints.getMe.initiate(null)),
            store.dispatch(
                ingredientsApi.endpoints.getIngredients.initiate(null),
            ),
        ]);

        const { result } = renderHookWithRouter(
            () => useRecipeListView(RECIPE_SOURCE.all),
            { store, initialEntries: ["/test?q=Borscht"] },
        );

        expect(result.current.recipes).toEqual([RECIPE_1]);
        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.recipes.byFilters, {
            params: { ...paramsWithSearch, limit: PAGE_SIZE, offset: 0 },
        });
    });

    it("should send the picked ingredients as ingredient_ids in the request", async () => {
        mockedGet.mockImplementation((url: string) => {
            if (url === API_ROUTES.auth.me) {
                return Promise.resolve({ data: CURRENT_USER });
            }
            if (url === API_ROUTES.recipeTypes.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.ingredients.list) {
                return Promise.resolve({ data: [MILK] });
            }
            if (url === API_ROUTES.userIngredients.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.calories.intake) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.recipes.byFilters) {
                return Promise.resolve({
                    data: { items: [RECIPE_1], total: 1 },
                });
            }

            return Promise.reject(new Error(`unexpected GET ${url}`));
        });

        const store = makeTestStore();
        const paramsWithIngredientIds = { ingredient_ids: String(MILK.id) };

        await Promise.all([
            store.dispatch(
                recipesApi.endpoints.getRecipesByFilters.initiate(
                    paramsWithIngredientIds,
                ),
            ),
            store.dispatch(
                recipeTypesApi.endpoints.getRecipeTypes.initiate(null),
            ),
            store.dispatch(authApi.endpoints.getMe.initiate(null)),
            store.dispatch(
                ingredientsApi.endpoints.getIngredients.initiate(null),
            ),
        ]);

        const { result } = renderHookWithRouter(
            () => useRecipeListView(RECIPE_SOURCE.all),
            { store, initialEntries: [`/test?ingredients=${MILK.id}`] },
        );

        expect(result.current.recipes).toEqual([RECIPE_1]);
        expect(result.current.ingredients).toEqual([MILK]);
        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.recipes.byFilters, {
            params: {
                ...paramsWithIngredientIds,
                limit: PAGE_SIZE,
                offset: 0,
            },
        });
    });

    it("should not report the pantry as empty while the pantry query is still loading", async () => {
        let resolvePantry: (value: { data: unknown[] }) => void;
        const pendingPantry = new Promise<{ data: unknown[] }>((resolve) => {
            resolvePantry = resolve;
        });

        mockedGet.mockImplementation((url: string) => {
            if (url === API_ROUTES.auth.me) {
                return Promise.resolve({ data: CURRENT_USER });
            }
            if (url === API_ROUTES.recipeTypes.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.ingredients.list) {
                return Promise.resolve({ data: [] });
            }
            // stays unresolved until the test settles it, simulating a cold-cache visit to a shared ?pantry=1 link
            if (url === API_ROUTES.userIngredients.list) {
                return pendingPantry;
            }
            if (url === API_ROUTES.recipes.byFilters) {
                return Promise.resolve({
                    data: { items: [RECIPE_1], total: 1 },
                });
            }

            return Promise.reject(new Error(`unexpected GET ${url}`));
        });

        const { result } = await setup(RECIPE_SOURCE.all, ["/test?pantry=1"]);

        expect(result.current.isPantryEmpty).toBe(false);

        await act(async () => {
            resolvePantry({ data: [] });
            await pendingPantry;
        });

        expect(result.current.isPantryEmpty).toBe(true);
    });

    it("should not request the pantry while the session is still checking (guest-safe on a public list)", () => {
        mockedGet.mockImplementation((url: string) => {
            if (url === API_ROUTES.recipeTypes.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.ingredients.list) {
                return Promise.resolve({ data: [] });
            }
            if (url === API_ROUTES.recipes.byFilters) {
                return Promise.resolve({ data: { items: [], total: 0 } });
            }

            return Promise.reject(new Error(`unexpected GET ${url}`));
        });

        renderHookWithRouter(() => useRecipeListView(RECIPE_SOURCE.all), {
            store: makeTestStore(),
        });

        expect(mockedGet).not.toHaveBeenCalledWith(
            API_ROUTES.userIngredients.list,
            expect.anything(),
        );
    });
});
