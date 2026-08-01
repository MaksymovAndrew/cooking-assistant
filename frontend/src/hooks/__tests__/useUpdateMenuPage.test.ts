import { act } from "@testing-library/react";
import type * as ReactRouterDom from "react-router-dom";

import type { MenuDetails } from "types/menu";

import { API_ROUTES } from "api/endpoints";

import { menuCategoriesApi } from "redux/services/menuCategoriesApi";
import { menusApi } from "redux/services/menusApi";
import { recipesApi } from "redux/services/recipesApi";

import { useUpdateMenuPage } from "hooks/useUpdateMenuPage";

import { mockedPut, mockGetByUrl } from "test/apiClientMock";
import { ROUTE_ALL_MENUS } from "test/constants";
import { mockNavigate } from "test/router";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual<typeof ReactRouterDom>("react-router-dom"),
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "1" }),
}));
jest.mock("api/client");

const TITLE = "Weekday menu";
const CATEGORY_ID = 2;
// distinct from recipe_id on purpose: the hook must map menu.recipes through recipe_id, so a test that conflated the two fields could pass for the wrong reason
const MENU_RECIPE = {
    id: 99,
    recipe_id: 10,
    title: "Borscht",
    type_name: "Soup",
    cooking_time: 60,
    creation_date: "2024-01-01",
    calories_per_portion: null,
};
const CATEGORIES = [{ menu_category_id: CATEGORY_ID, category_name: "Lunch" }];

const SAMPLE: MenuDetails = {
    menu: {
        id: 1,
        title: TITLE,
        categoryname: "Lunch",
        menucontent: "quick",
        category_id: CATEGORY_ID,
        isOwner: true,
    },
    recipes: [MENU_RECIPE],
    allergens: [],
};

// pre-seed the cache by awaiting the real query thunks before the hook mounts, so useGetMenuByIdQuery/etc. read already-fulfilled data on first render instead of racing a guessed number of promise ticks
const setup = async (sample: MenuDetails = SAMPLE) => {
    mockGetByUrl({
        [API_ROUTES.menu.byId("1")]: sample,
        [API_ROUTES.menuCategories.list]: CATEGORIES,
        [API_ROUTES.recipes.list]: [],
    });

    const store = makeTestStore();

    await Promise.all([
        store.dispatch(menusApi.endpoints.getMenuById.initiate("1")),
        store.dispatch(
            menuCategoriesApi.endpoints.getMenuCategories.initiate(null),
        ),
        store.dispatch(recipesApi.endpoints.getAllRecipes.initiate(null)),
    ]);

    return renderHookWithStore(() => useUpdateMenuPage(), store);
};

describe("useUpdateMenuPage", () => {
    it("should fill the form from the loaded menu", async () => {
        const { result } = await setup();

        expect(result.current.form.menuTitle).toBe(TITLE);
        expect(result.current.form.selectedCategory).toBe(CATEGORY_ID);
        expect(result.current.isLoading).toBe(false);
    });

    it("should update the menu and navigate to menus on valid submit", async () => {
        mockedPut.mockResolvedValue({ data: null });
        const { result } = await setup();

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.menu.byId("1"),
            expect.objectContaining({
                menuTitle: TITLE,
                categoryId: CATEGORY_ID,
                recipeIds: [MENU_RECIPE.recipe_id],
            }),
        );
        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_ALL_MENUS);
    });

    it("should not call the mutation when no recipes are selected", async () => {
        const { result } = await setup({ ...SAMPLE, recipes: [] });

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
