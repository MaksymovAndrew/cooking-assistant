import { act } from "@testing-library/react";

import type { CurrentUser } from "types/auth";
import type { Menu } from "types/menu";
import type { RecipeSearchResultItem } from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import { authApi } from "redux/services/authApi";
import { menusApi } from "redux/services/menusApi";
import { recipesApi } from "redux/services/recipesApi";

import { useProfilePage } from "hooks/useProfilePage";

import { mockGetByUrl } from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

const CURRENT_USER: CurrentUser = {
    id: 1,
    name: "Claude",
    surname: "Cook",
    login: "claude",
    created_at: "2025-06-15T00:00:00.000Z",
    email: "claude@example.com",
    email_verified_at: null,
    avatar: null,
};
const RECIPE: RecipeSearchResultItem = {
    id: 1,
    title: "Borscht",
    type_name: "Soup",
    creation_date: "2024-01-01",
    cooking_time: 60,
    ingredients: [],
};
const MENU: Menu = {
    id: 1,
    title: "Weekday menu",
    categoryname: "Lunch",
    menucontent: "",
    recipe_count: 3,
};

const RECIPES_PARAMS = { ingredient_name: "" };
const MENUS_PARAMS = { menu_name: "" };

const setup = async () => {
    mockGetByUrl({
        [API_ROUTES.auth.me]: CURRENT_USER,
        [API_ROUTES.recipes.byPerson]: { items: [RECIPE], total: 1 },
        [API_ROUTES.menu.byPerson]: { items: [MENU], total: 1 },
    });

    const store = makeTestStore();

    await Promise.all([
        store.dispatch(authApi.endpoints.getMe.initiate(null)),
        store.dispatch(
            recipesApi.endpoints.getRecipesByPerson.initiate(RECIPES_PARAMS),
        ),
        store.dispatch(
            menusApi.endpoints.getMenusByPerson.initiate(MENUS_PARAMS),
        ),
    ]);

    return renderHookWithStore(() => useProfilePage(), store);
};

describe("useProfilePage", () => {
    it("should load the current user and person-scoped recipes/menus", async () => {
        const { result } = await setup();

        expect(result.current.currentUser).toEqual(CURRENT_USER);
        expect(result.current.recipes).toEqual([RECIPE]);
        expect(result.current.recipesCount).toBe(1);
        expect(result.current.menus).toEqual([MENU]);
        expect(result.current.menusCount).toBe(1);
    });

    it("should default the active tab to recipes and allow switching", async () => {
        const { result } = await setup();

        expect(result.current.activeTab).toBe("recipes");

        act(() => {
            result.current.setActiveTab("menus");
        });

        expect(result.current.activeTab).toBe("menus");
    });
});
