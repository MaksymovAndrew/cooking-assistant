import { act } from "@testing-library/react";

import type { MenuDetails } from "types/menu";

import { API_ROUTES } from "api/endpoints";

import { menuCategoriesApi } from "redux/services/menuCategoriesApi";
import { menusApi } from "redux/services/menusApi";

import { useUpdateMenuPage } from "hooks/useUpdateMenuPage";

import { mockedPut, mockGetByUrl } from "test/apiClientMock";
import { ROUTE_ALL_MENUS, TEST_AUTHOR, TEST_UNRATED } from "test/constants";
import { setTestParams } from "test/nextNavigationMock";
import { mockNavigate } from "test/router";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

const TITLE = "Weekday menu";
const CATEGORY_ID = 2;
// id differs from recipe_id on purpose, so a hook mapping the wrong field fails here
const MENU_RECIPE = {
    id: 99,
    recipe_id: 10,
    title: "Borscht",
    language: "en" as const,
    type_name: "Soup",
    cooking_time: 60,
    creation_date: "2024-01-01",
    calories_per_portion: null,
    photo_key: null,
    ratingAverage: null,
    ratingCount: 0,
};
const CATEGORIES = [{ menu_category_id: CATEGORY_ID, category_name: "Lunch" }];

const SAMPLE: MenuDetails = {
    menu: {
        creation_date: "2026-01-01T00:00:00.000Z",
        id: 1,
        title: TITLE,
        language: "en",
        categoryName: "Lunch",
        menuContent: "quick",
        category_id: CATEGORY_ID,
        isOwner: true,
        photo_key: null,
        ...TEST_UNRATED,
        author: TEST_AUTHOR,
        isFavourite: false,
    },
    recipes: [MENU_RECIPE],
    allergens: [],
};

// the cache is filled before the hook mounts, so its queries read finished data on first render
const setup = async (sample: MenuDetails = SAMPLE) => {
    mockGetByUrl({
        [API_ROUTES.menu.byId("1")]: sample,
        [API_ROUTES.menuCategories.list]: CATEGORIES,
    });

    const store = makeTestStore();

    await Promise.all([
        store.dispatch(menusApi.endpoints.getMenuById.initiate("1")),
        store.dispatch(
            menuCategoriesApi.endpoints.getMenuCategories.initiate(null),
        ),
    ]);

    return renderHookWithStore(() => useUpdateMenuPage(), store);
};

describe("useUpdateMenuPage", () => {
    beforeEach(() => {
        setTestParams({ id: "1" });
    });

    it("should fill the form from the loaded menu", async () => {
        const { result } = await setup();

        expect(result.current.form.menuTitle).toBe(TITLE);
        expect(result.current.form.selectedCategory).toBe(CATEGORY_ID);
        expect(result.current.form.selectedRecipes).toEqual([
            {
                id: MENU_RECIPE.recipe_id,
                title: "Borscht",
                type_name: "Soup",
                creation_date: "2024-01-01",
                cooking_time: 60,
            },
        ]);
        expect(result.current.pageState).toBe("ready");
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
