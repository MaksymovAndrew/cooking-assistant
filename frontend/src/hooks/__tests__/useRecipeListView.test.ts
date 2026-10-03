import { act } from "@testing-library/react";

import { PAGE_SIZE } from "constants/pagination";
import type { CurrentUser } from "types/auth";
import type { Ingredient } from "types/ingredient";
import type { RecipeListItem } from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import { authApi } from "redux/services/authApi";
import { ingredientsApi } from "redux/services/ingredientsApi";
import { recipesApi } from "redux/services/recipesApi";
import { recipeTypesApi } from "redux/services/recipeTypesApi";

import { RECIPE_SOURCE, useRecipeListView } from "hooks/useRecipeListView";

import {
    byOffset,
    makeAxiosError,
    mockedGet,
    mockGetByUrl,
} from "test/apiClientMock";
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
    avatar_photo_key: null,
    calorie_goal: null,
    locale: "en",
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

// matches what the hook sends with no filters in the URL, so the pre-filled cache key lines up
const DEFAULT_PARAMS = {};

const FAILURE_MESSAGE = "Recipes failed";
const FAILURE = makeAxiosError(500, FAILURE_MESSAGE);

// everything a signed-in visitor's list page loads besides the recipes themselves
const BASE_GETS = {
    [API_ROUTES.auth.me]: CURRENT_USER,
    [API_ROUTES.recipeTypes.list]: [],
    [API_ROUTES.ingredients.list]: [],
    [API_ROUTES.userIngredients.list]: [],
    [API_ROUTES.calories.intake]: [],
};

const page = (items: RecipeListItem[], total = items.length) => ({
    items,
    total,
});

// the base GETs, with the recipe list answering per requested page
const mockRecipePages = (pageAt: (offset: number) => Promise<unknown>) => {
    mockGetByUrl(BASE_GETS);
    const loadByUrl = mockedGet.getMockImplementation();

    mockedGet.mockImplementation((url: string, config?: unknown) => {
        if (url === API_ROUTES.recipes.byFilters) {
            return pageAt(byOffset(config));
        }

        return loadByUrl ? loadByUrl(url) : Promise.reject(new Error(url));
    });
};

// the cache is filled before the hook mounts, so it reads finished data instead of racing promise ticks
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
        mockGetByUrl({
            ...BASE_GETS,
            [API_ROUTES.recipes.byFilters]: page([RECIPE_1, RECIPE_2]),
        });

        const { result } = await setup();

        expect(result.current.recipes).toEqual([RECIPE_1, RECIPE_2]);
        expect(result.current.total).toBe(2);
        expect(result.current.loadedCount).toBe(2);
        expect(result.current.hasNextPage).toBe(false);
        expect(result.current.noRecipes).toBe(false);
    });

    it("should report noRecipes once loading succeeds with zero results", async () => {
        mockGetByUrl({
            ...BASE_GETS,
            [API_ROUTES.recipes.byFilters]: page([]),
        });

        const { result } = await setup();

        expect(result.current.noRecipes).toBe(true);
        expect(result.current.recipes).toEqual([]);
    });

    it("should request the current user's recipes when the source is person", async () => {
        mockGetByUrl({
            ...BASE_GETS,
            [API_ROUTES.recipes.byPerson]: page([RECIPE_1]),
        });

        const { result } = await setup(RECIPE_SOURCE.person);

        expect(result.current.recipes).toEqual([RECIPE_1]);
        expect(mockedGet).toHaveBeenCalledWith(
            API_ROUTES.recipes.byPerson,
            expect.anything(),
        );
    });

    it("should fetch the next page and append it without dropping earlier rows", async () => {
        mockRecipePages((offset) =>
            Promise.resolve({
                data: page(offset === 0 ? [RECIPE_1] : [RECIPE_2], 2),
            }),
        );

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

        mockRecipePages(() => Promise.reject(FAILURE));

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
        mockRecipePages((offset) =>
            offset === 0
                ? Promise.resolve({ data: page([RECIPE_1], 2) })
                : Promise.reject(FAILURE),
        );

        const { result } = await setup();

        await act(async () => {
            await result.current.fetchNextPage();
        });

        expect(result.current.recipes).toEqual([RECIPE_1]);
        expect(result.current.loadMoreError).toBe(FAILURE_MESSAGE);
        expect(result.current.error).toBeNull();
    });

    it("should send the search text as recipe_name in the request", async () => {
        mockGetByUrl({
            ...BASE_GETS,
            [API_ROUTES.recipes.byFilters]: page([RECIPE_1]),
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
        mockGetByUrl({
            ...BASE_GETS,
            [API_ROUTES.ingredients.list]: [MILK],
            [API_ROUTES.recipes.byFilters]: page([RECIPE_1]),
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

        mockGetByUrl({
            ...BASE_GETS,
            [API_ROUTES.recipes.byFilters]: page([RECIPE_1]),
        });
        const loadByUrl = mockedGet.getMockImplementation();

        // stays unresolved until the test settles it, simulating a cold-cache visit to a shared ?pantry=1 link
        mockedGet.mockImplementation((url: string) => {
            if (url === API_ROUTES.userIngredients.list) {
                return pendingPantry;
            }

            return loadByUrl ? loadByUrl(url) : Promise.reject(new Error(url));
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
        mockGetByUrl({
            ...BASE_GETS,
            [API_ROUTES.recipes.byFilters]: page([]),
        });

        renderHookWithRouter(() => useRecipeListView(RECIPE_SOURCE.all), {
            store: makeTestStore(),
        });

        expect(mockedGet).not.toHaveBeenCalledWith(
            API_ROUTES.userIngredients.list,
            expect.anything(),
        );
    });

    it("should drop in_pantry from the request for a guest instead of sending a filter the backend rejects", async () => {
        mockGetByUrl({
            ...BASE_GETS,
            [API_ROUTES.auth.me]: null,
            [API_ROUTES.recipes.byFilters]: page([RECIPE_1]),
        });

        const { result } = await setup(RECIPE_SOURCE.all, [
            "/test?pantry=true",
        ]);

        expect(result.current.recipes).toEqual([RECIPE_1]);
        expect(mockedGet).not.toHaveBeenCalledWith(
            API_ROUTES.userIngredients.list,
            expect.anything(),
        );
        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.recipes.byFilters, {
            params: { limit: PAGE_SIZE, offset: 0 },
        });
    });
});
