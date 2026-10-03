import { act } from "@testing-library/react";

import type { RecipeListItem } from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import { menuCategoriesApi } from "redux/services/menuCategoriesApi";

import { useCreateMenuPage } from "hooks/useCreateMenuPage";

import { mockedPost, mockGetByUrl } from "test/apiClientMock";
import { ROUTE_ALL_MENUS } from "test/constants";
import { mockNavigate } from "test/router";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

const CATEGORY_ID = 2;
const RECIPE_ID = 5;
const MENU_TITLE = "Weekday menu";
const MENU_DESCRIPTION = "Quick lunches";
const CATEGORIES = [{ menu_category_id: CATEGORY_ID, category_name: "Lunch" }];
const RECIPES: RecipeListItem[] = [
    {
        id: RECIPE_ID,
        title: "Borscht",
        type_name: "Soup",
        creation_date: "2024-01-01",
        cooking_time: 60,
    },
];

// the cache is filled before the hook mounts, so its queries read finished data on first render
const setup = async () => {
    mockGetByUrl({
        [API_ROUTES.menuCategories.list]: CATEGORIES,
    });

    const store = makeTestStore();

    await store.dispatch(
        menuCategoriesApi.endpoints.getMenuCategories.initiate(null),
    );

    return renderHookWithStore(() => useCreateMenuPage(), store);
};

describe("useCreateMenuPage", () => {
    it("should create the menu and navigate to menus on valid submit", async () => {
        mockedPost.mockResolvedValue({
            data: { message: "Menu created", menuId: 42 },
        });
        const { result } = await setup();

        act(() => {
            result.current.form.setMenuTitle(MENU_TITLE);
            result.current.form.setMenuDescription(MENU_DESCRIPTION);
            result.current.form.setSelectedCategory(CATEGORY_ID);
            result.current.form.toggleRecipeSelection(RECIPES[0]);
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPost).toHaveBeenCalledWith(API_ROUTES.menu.create, {
            menuTitle: MENU_TITLE,
            menuContent: MENU_DESCRIPTION,
            language: "en",
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
            result.current.form.toggleRecipeSelection(RECIPES[0]);
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
