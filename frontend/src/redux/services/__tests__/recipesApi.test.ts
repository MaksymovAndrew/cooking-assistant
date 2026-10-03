import { PAGE_SIZE } from "constants/pagination";
import type {
    RecipeFilterParams,
    RecipeSearchResultItem,
    UpdateRecipeRequest,
} from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import { menusApi } from "redux/services/menusApi";
import { recipesApi } from "redux/services/recipesApi";

import { mockedDelete, mockedGet, mockedPut } from "test/apiClientMock";
import { TEST_AUTHOR, TEST_UNRATED } from "test/constants";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const LIST: RecipeSearchResultItem[] = [
    {
        id: 1,
        title: "Soup",
        language: "en",
        type_name: "Hot",
        creation_date: "2024-01-01",
        cooking_time: 30,
        calories_per_portion: null,
        ingredients: [{ id: 1, name: "Tomato", allergens: [] }],
        isOwner: false,
        photo_key: null,
        ...TEST_UNRATED,
        author: TEST_AUTHOR,
        isFavourite: false,
        containsAvoided: false,
        tags: [],
    },
];
const PAGE = { items: LIST, total: LIST.length };
const FILTERS: RecipeFilterParams = { sort_order: "asc" };
const UPDATE: UpdateRecipeRequest = {
    title: "Soup",
    language: "en",
    content: "boil",
    type_id: 1,
    cooking_time: 30,
    calories_override: null,
    ingredients: [{ id: 1, quantity_recipe_ingredients: 2 }],
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

    it("should invalidate a cached menu after deleting a recipe, since the backend cascades the delete into that menu's recipes", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        mockedGet.mockResolvedValue({
            data: {
                id: 9,
                title: "Sunday dinner",
                recipes: [],
                category_id: 1,
                categoryName: "Dinner",
                isOwner: true,
                isFavourite: false,
                containsAvoided: false,
                tags: [],
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

    it("should refetch a cached menu after updating a recipe, since the menu shows its recipes", async () => {
        mockedPut.mockResolvedValue({ data: null });
        mockedGet.mockResolvedValue({ data: null });
        const store = makeTestStore();
        const menu = store.dispatch(menusApi.endpoints.getMenuById.initiate(9));

        await menu;
        mockedGet.mockClear();

        await store.dispatch(
            recipesApi.endpoints.updateRecipe.initiate({
                id: "1",
                data: UPDATE,
            }),
        );
        await store.dispatch(menusApi.endpoints.getMenuById.initiate(9));

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.menu.byId(9), {
            params: undefined,
        });
        menu.unsubscribe();
    });
});
