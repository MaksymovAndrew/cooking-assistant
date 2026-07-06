import { act } from "@testing-library/react";
import type * as ReactRouterDom from "react-router-dom";

import { API_ROUTES } from "api/endpoints";

import { menuCategoriesApi } from "redux/services/menuCategoriesApi";
import { recipesApi } from "redux/services/recipesApi";

import { useCreateMenuPage } from "hooks/useCreateMenuPage";

import { mockedPost, mockGetByUrl } from "test/apiClientMock";
import { ROUTE_ALL_MENUS } from "test/constants";
import { mockNavigate } from "test/router";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual<typeof ReactRouterDom>("react-router-dom"),
    useNavigate: () => mockNavigate,
}));
jest.mock("api/client");

const CATEGORY_ID = 2;
const RECIPE_ID = 5;
const MENU_TITLE = "Weekday menu";
const MENU_DESCRIPTION = "Quick lunches";
const CATEGORIES = [{ menu_category_id: CATEGORY_ID, category_name: "Lunch" }];
const RECIPES = [
    {
        id: RECIPE_ID,
        title: "Borscht",
        type_name: "Soup",
        creation_date: "2024-01-01",
        cooking_time: 60,
        ingredients: [],
    },
];

// pre-seed the cache by awaiting the real query thunks before the hook mounts,
// so the reference-data queries read already-fulfilled data on first render
const setup = async () => {
    mockGetByUrl({
        [API_ROUTES.menuCategories.list]: CATEGORIES,
        [API_ROUTES.recipes.list]: RECIPES,
    });

    const store = makeTestStore();

    await Promise.all([
        store.dispatch(
            menuCategoriesApi.endpoints.getMenuCategories.initiate(null),
        ),
        store.dispatch(recipesApi.endpoints.getAllRecipes.initiate(null)),
    ]);

    return renderHookWithStore(() => useCreateMenuPage(), store);
};

describe("useCreateMenuPage", () => {
    it("should create the menu and navigate to menus on valid submit", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const { result } = await setup();

        act(() => {
            result.current.form.setMenuTitle(MENU_TITLE);
            result.current.form.setMenuDescription(MENU_DESCRIPTION);
            result.current.form.setSelectedCategory(CATEGORY_ID);
            result.current.form.toggleRecipeSelection(RECIPE_ID);
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPost).toHaveBeenCalledWith(API_ROUTES.menu.create, {
            menuTitle: MENU_TITLE,
            menuContent: MENU_DESCRIPTION,
            categoryId: CATEGORY_ID,
            recipeIds: [RECIPE_ID],
        });
        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_ALL_MENUS);
    });

    it("should not call the mutation when the form is empty", async () => {
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
            result.current.form.setMenuTitle(MENU_TITLE);
            result.current.form.setMenuDescription(MENU_DESCRIPTION);
            result.current.form.setSelectedCategory(CATEGORY_ID);
            result.current.form.toggleRecipeSelection(RECIPE_ID);
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
