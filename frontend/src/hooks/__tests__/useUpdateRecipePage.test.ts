import { act } from "@testing-library/react";
import type * as ReactRouterDom from "react-router-dom";

import type { RecipeDetails } from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import { ingredientsApi } from "redux/services/ingredientsApi";
import { recipesApi } from "redux/services/recipesApi";
import { recipeTypesApi } from "redux/services/recipeTypesApi";

import { useUpdateRecipePage } from "hooks/useUpdateRecipePage";

import { mockedPut, mockGetByUrl } from "test/apiClientMock";
import { ROUTE_ALL_RECIPES } from "test/constants";
import { mockNavigate } from "test/router";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual<typeof ReactRouterDom>("react-router-dom"),
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "1" }),
}));
jest.mock("api/client");

const TITLE = "Borscht";
const SAMPLE: RecipeDetails = {
    id: 1,
    title: TITLE,
    content: "boil",
    ingredients: [],
    type_id: 2,
    type_name: "Soup",
    cooking_time: 60,
    creation_date: "2024-01-01",
    servings: "4",
    person_id: 3,
    isOwner: true,
};

const SAMPLE_WITH_INGREDIENT: RecipeDetails = {
    ...SAMPLE,
    ingredients: [
        {
            id: 7,
            slug: "beet",
            name: "Beet",
            category: "vegetables",
            quantity_recipe_ingredients: 3,
            unit_name: "pcs",
            allergens: [],
        },
    ],
};

// pre-seed the cache by awaiting the real query thunks before the hook mounts, so useGetRecipeByIdQuery/etc. read already-fulfilled data on first render
const setup = async (recipe: RecipeDetails = SAMPLE) => {
    mockGetByUrl({
        [API_ROUTES.recipes.byId("1")]: recipe,
        [API_ROUTES.ingredients.list]: [],
        [API_ROUTES.recipeTypes.list]: [],
    });

    const store = makeTestStore();

    await Promise.all([
        store.dispatch(recipesApi.endpoints.getRecipeById.initiate("1")),
        store.dispatch(ingredientsApi.endpoints.getIngredients.initiate(null)),
        store.dispatch(recipeTypesApi.endpoints.getRecipeTypes.initiate(null)),
    ]);

    return renderHookWithStore(() => useUpdateRecipePage(), store);
};

describe("useUpdateRecipePage", () => {
    it("should fill the form from the loaded recipe", async () => {
        const { result } = await setup();

        expect(result.current.form.title).toBe(TITLE);
        expect(result.current.isLoading).toBe(false);
    });

    it("should round-trip an existing ingredient's quantity field between the recipe and update shapes", async () => {
        mockedPut.mockResolvedValue({ data: null });
        const { result } = await setup(SAMPLE_WITH_INGREDIENT);
        const [loadedIngredient] = SAMPLE_WITH_INGREDIENT.ingredients;

        expect(result.current.form.selectedIngredients).toEqual([
            {
                id: loadedIngredient.id,
                slug: loadedIngredient.slug,
                name: loadedIngredient.name,
                quantity: loadedIngredient.quantity_recipe_ingredients,
                unit_name: loadedIngredient.unit_name,
            },
        ]);

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.recipes.byId("1"),
            expect.objectContaining({
                ingredients: [
                    {
                        id: loadedIngredient.id,
                        quantity_recipe_ingredients:
                            loadedIngredient.quantity_recipe_ingredients,
                    },
                ],
            }),
        );
    });

    it("should update the recipe and navigate home on valid submit", async () => {
        mockedPut.mockResolvedValue({ data: null });
        const { result } = await setup();

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.recipes.byId("1"),
            expect.objectContaining({
                title: TITLE,
                cooking_time: 60,
                // the form has no servings field - the recipe's existing value must be resent unchanged, not dropped
                servings: SAMPLE.servings,
            }),
        );
        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_ALL_RECIPES);
    });

    it("should not call the mutation when the cooking time is invalid", async () => {
        const { result } = await setup();

        act(() => {
            result.current.form.setCookingMinutes("99");
        });
        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPut).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should stay put when the update mutation fails", async () => {
        mockedPut.mockRejectedValue({
            isAxiosError: true,
            response: { status: 500, data: { error: "Server error" } },
            message: "Request failed",
        });
        const { result } = await setup();

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
