import { act } from "@testing-library/react";

import type { CurrentUser } from "types/auth";
import type { Menu } from "types/menu";
import type { RecipeSearchResultItem } from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import { authApi } from "redux/services/authApi";
import { menusApi } from "redux/services/menusApi";
import { recipesApi } from "redux/services/recipesApi";
import type { AppStore } from "redux/store";

import { useProfilePage } from "hooks/useProfilePage";

import { mockedGet, mockGetByUrl } from "test/apiClientMock";
import { TEST_AUTHOR, TEST_UNRATED } from "test/constants";
import { makeTestStore, renderHookWithRouter } from "test/store";

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
    avatar_photo_key: null,
    calorie_goal: null,
    locale: "en",
};
const RECIPE: RecipeSearchResultItem = {
    id: 1,
    title: "Borscht",
    language: "en",
    type_name: "Soup",
    creation_date: "2024-01-01",
    cooking_time: 60,
    calories_per_portion: null,
    ingredients: [],
    isOwner: true,
    photo_key: null,
    ...TEST_UNRATED,
    author: TEST_AUTHOR,
    isFavourite: false,
    containsAvoided: false,
    tags: [],
};
const MENU: Menu = {
    id: 1,
    title: "Weekday menu",
    categoryName: "Lunch",
    menuContent: "",
    recipe_count: 3,
};

const RECIPES_PARAMS = {};
const MENUS_PARAMS = { menu_name: "" };
const FAVOURITES_PARAMS = { favourites: true };

const GETS = {
    [API_ROUTES.auth.me]: CURRENT_USER,
    [API_ROUTES.recipes.byPerson]: { items: [RECIPE], total: 1 },
    [API_ROUTES.menu.byPerson]: { items: [MENU], total: 1 },
    [API_ROUTES.recipes.byFilters]: { items: [RECIPE], total: 1 },
    [API_ROUTES.menu.list]: { items: [MENU], total: 1 },
    [API_ROUTES.calories.intake]: [],
};

const preloadAllButOwnRecipes = (store: AppStore) =>
    Promise.all([
        store.dispatch(authApi.endpoints.getMe.initiate(null)),
        store.dispatch(
            menusApi.endpoints.getMenusByPerson.initiate(MENUS_PARAMS),
        ),
        store.dispatch(
            recipesApi.endpoints.getRecipesByFilters.initiate(
                FAVOURITES_PARAMS,
            ),
        ),
        store.dispatch(menusApi.endpoints.getMenus.initiate(FAVOURITES_PARAMS)),
    ]);

const setup = async (initialEntries?: string[]) => {
    mockGetByUrl(GETS);

    const store = makeTestStore();

    await Promise.all([
        preloadAllButOwnRecipes(store),
        store.dispatch(
            recipesApi.endpoints.getRecipesByPerson.initiate(RECIPES_PARAMS),
        ),
    ]);

    return renderHookWithRouter(() => useProfilePage(), {
        store,
        initialEntries,
    });
};

describe("useProfilePage", () => {
    it("should load the current user and person-scoped recipes/menus", async () => {
        const { result } = await setup();

        expect(result.current.currentUser).toEqual(CURRENT_USER);
        expect(result.current.recipes).toEqual([RECIPE]);
        expect(result.current.recipesCount).toBe(1);
        expect(result.current.menus).toEqual([MENU]);
        expect(result.current.menusCount).toBe(1);
        expect(result.current.kcalToday).toBe(0);
    });

    it("should default the active tab to recipes and allow switching", async () => {
        const { result } = await setup();

        expect(result.current.activeTab).toBe("recipes");

        act(() => {
            result.current.setActiveTab("menus");
        });

        expect(result.current.activeTab).toBe("menus");
    });

    it("should deep-link into the dietary tab via the tab query param", async () => {
        const { result } = await setup(["/profile?tab=dietary"]);

        expect(result.current.activeTab).toBe("dietary");
    });

    it("should ignore an unknown tab query param and default to recipes", async () => {
        const { result } = await setup(["/profile?tab=bogus"]);

        expect(result.current.activeTab).toBe("recipes");
    });

    it("should report the active tab's loading state, with nothing to wait for on the dietary tab", async () => {
        mockGetByUrl(GETS);
        const loadByUrl = mockedGet.getMockImplementation();

        mockedGet.mockImplementation((url: string) => {
            if (url === API_ROUTES.recipes.byPerson) {
                return new Promise(() => undefined);
            }

            return loadByUrl ? loadByUrl(url) : Promise.reject(new Error(url));
        });
        const store = makeTestStore();

        await preloadAllButOwnRecipes(store);

        const { result } = renderHookWithRouter(() => useProfilePage(), {
            store,
        });

        expect(result.current.tabStatus.isLoading).toBe(true);

        act(() => {
            result.current.setActiveTab("dietary");
        });

        expect(result.current.tabStatus.isLoading).toBe(false);
    });
});
