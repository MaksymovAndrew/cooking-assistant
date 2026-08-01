import { PAGE_SIZE } from "constants/pagination";
import type {
    CreateRecipeRequest,
    RecipeDetails,
    RecipeFilterParams,
    RecipeSearchResultItem,
    UpdateRecipeRequest,
} from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import { menusApi } from "redux/services/menusApi";
import { recipesApi } from "redux/services/recipesApi";

import {
    mockedDelete,
    mockedGet,
    mockedPost,
    mockedPut,
} from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const LIST: RecipeSearchResultItem[] = [
    {
        id: 1,
        title: "Soup",
        type_name: "Hot",
        creation_date: "2024-01-01",
        cooking_time: 30,
        calories_per_portion: null,
        ingredients: [{ id: 1, name: "Tomato", allergens: [] }],
    },
];
const PAGE = { items: LIST, total: LIST.length };
const FILTERS: RecipeFilterParams = { sort_order: "asc" };
const CREATE: CreateRecipeRequest = {
    title: "Soup",
    content: "boil",
    ingredients: [{ id: 1, quantity: 2 }],
    type_id: 1,
    cooking_time: 30,
    calories_override: null,
};
const UPDATE: UpdateRecipeRequest = {
    title: "Soup",
    content: "boil",
    type_id: 1,
    cooking_time: 30,
    calories_override: null,
    ingredients: [{ id: 1, quantity_recipe_ingredients: 2 }],
};
const DETAIL: RecipeDetails = {
    id: 1,
    title: "Soup",
    content: "boil",
    ingredients: [],
    type_id: 1,
    type_name: "Hot",
    cooking_time: 30,
    creation_date: "2024-01-01",
    person_id: 1,
    isOwner: true,
    calories_per_portion: null,
    calories_override: null,
};

describe("recipesApi", () => {
    it("should fetch recipes by filters", async () => {
        mockedGet.mockResolvedValue({ data: PAGE });
        const store = makeTestStore();

        const result = await store.dispatch(
            recipesApi.endpoints.getRecipesByFilters.initiate(FILTERS),
        );

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.recipes.byFilters, {
            params: { ...FILTERS, limit: PAGE_SIZE, offset: 0 },
        });
        expect(result.data).toEqual({ pages: [PAGE], pageParams: [0] });
    });

    it("should fetch the current user's recipes by filters", async () => {
        mockedGet.mockResolvedValue({ data: PAGE });
        const store = makeTestStore();

        await store.dispatch(
            recipesApi.endpoints.getRecipesByPerson.initiate(FILTERS),
        );

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.recipes.byPerson, {
            params: { ...FILTERS, limit: PAGE_SIZE, offset: 0 },
        });
    });

    it("should fetch all recipes for statistics", async () => {
        mockedGet.mockResolvedValue({ data: [] });
        const store = makeTestStore();

        await store.dispatch(recipesApi.endpoints.getAllRecipes.initiate(null));

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.recipes.list, {
            params: undefined,
        });
    });

    it("should fetch a recipe by id", async () => {
        mockedGet.mockResolvedValue({ data: DETAIL });
        const store = makeTestStore();

        const result = await store.dispatch(
            recipesApi.endpoints.getRecipeById.initiate("1"),
        );

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.recipes.byId("1"), {
            params: undefined,
        });
        expect(result.data).toEqual(DETAIL);
    });

    it("should create a recipe", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            recipesApi.endpoints.createRecipe.initiate(CREATE),
        );

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.recipes.create,
            CREATE,
        );
    });

    it("should update a recipe", async () => {
        mockedPut.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            recipesApi.endpoints.updateRecipe.initiate({
                id: "1",
                data: UPDATE,
            }),
        );

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.recipes.byId("1"),
            UPDATE,
        );
    });

    it("should delete a recipe", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(recipesApi.endpoints.deleteRecipe.initiate("1"));

        expect(mockedDelete).toHaveBeenCalledWith(
            API_ROUTES.recipes.byId("1"),
            {
                params: undefined,
            },
        );
    });

    it("should invalidate a cached menu after deleting a recipe, since the backend cascades the delete into that menu's recipes", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        mockedGet.mockResolvedValue({
            data: {
                id: 9,
                title: "Sunday dinner",
                recipes: [],
                category_id: 1,
                categoryname: "Dinner",
                isOwner: true,
            },
        });
        const store = makeTestStore();

        await store.dispatch(menusApi.endpoints.getMenuById.initiate(9));
        const callsAfterFirstFetch = mockedGet.mock.calls.length;

        await store.dispatch(recipesApi.endpoints.deleteRecipe.initiate("1"));
        await store.dispatch(menusApi.endpoints.getMenuById.initiate(9));

        expect(mockedGet.mock.calls.length).toBeGreaterThan(
            callsAfterFirstFetch,
        );
    });
});
