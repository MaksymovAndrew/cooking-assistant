import { act } from "@testing-library/react";
import type * as ReactRouterDom from "react-router-dom";

import { API_ROUTES } from "api/endpoints";

import { ingredientsApi } from "redux/services/ingredientsApi";
import { recipeTypesApi } from "redux/services/recipeTypesApi";

import { useCreateRecipePage } from "hooks/useCreateRecipePage";

import { mockedPost, mockGetByUrl } from "test/apiClientMock";
import { ROUTE_ALL_RECIPES } from "test/constants";
import { mockNavigate } from "test/router";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual<typeof ReactRouterDom>("react-router-dom"),
    useNavigate: () => mockNavigate,
}));
jest.mock("api/client");

const TYPE_ID = 3;
const INGREDIENT_ID = 11;
const TITLE = "Mashed potatoes";
const DESCRIPTION = "Boil and mash";
const SAMPLE_TYPES = [{ id: TYPE_ID, type_name: "Soup", description: "" }];
const SAMPLE_INGREDIENTS = [
    { id: INGREDIENT_ID, name: "Potato", unit_name: "g", allergens: null },
];

// pre-seed the cache by awaiting the real query thunks before the hook mounts,
// so the reference-data queries read already-fulfilled data on first render
const setup = async () => {
    mockGetByUrl({
        [API_ROUTES.ingredients.list]: SAMPLE_INGREDIENTS,
        [API_ROUTES.recipeTypes.list]: SAMPLE_TYPES,
    });

    const store = makeTestStore();

    await Promise.all([
        store.dispatch(ingredientsApi.endpoints.getIngredients.initiate(null)),
        store.dispatch(recipeTypesApi.endpoints.getRecipeTypes.initiate(null)),
    ]);

    return renderHookWithStore(() => useCreateRecipePage(), store);
};

describe("useCreateRecipePage", () => {
    it("should create the recipe and navigate home on valid submit", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const { result } = await setup();

        act(() => {
            result.current.form.setTitle(TITLE);
            result.current.form.setContent(DESCRIPTION);
            result.current.form.setCookingHours("0");
            result.current.form.setCookingMinutes("30");
            result.current.form.setSelectedTypeId(TYPE_ID);
            result.current.form.toggleIngredientSelection(
                SAMPLE_INGREDIENTS[0],
            );
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.recipes.create,
            expect.objectContaining({
                title: TITLE,
                content: DESCRIPTION,
                type_id: TYPE_ID,
                ingredients: [{ id: INGREDIENT_ID, quantity: 1 }],
            }),
        );
        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_ALL_RECIPES);
    });

    it("should not call the mutation when required fields are empty", async () => {
        const { result } = await setup();

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPost).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should stay put when the create mutation fails", async () => {
        mockedPost.mockRejectedValue({
            isAxiosError: true,
            response: { status: 500, data: { error: "Server error" } },
            message: "Request failed",
        });
        const { result } = await setup();

        act(() => {
            result.current.form.setTitle(TITLE);
            result.current.form.setContent(DESCRIPTION);
            result.current.form.setCookingHours("0");
            result.current.form.setCookingMinutes("30");
            result.current.form.setSelectedTypeId(TYPE_ID);
            result.current.form.toggleIngredientSelection(
                SAMPLE_INGREDIENTS[0],
            );
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
