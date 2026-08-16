import { act } from "@testing-library/react";

import type { Menu } from "types/menu";
import type { RecipeListItem, RecipeWithIngredientNames } from "types/recipe";
import type { UserIngredient } from "types/userIngredient";

import { API_ROUTES } from "api/endpoints";

import { menusApi } from "redux/services/menusApi";
import { recipesApi } from "redux/services/recipesApi";
import { userIngredientsApi } from "redux/services/userIngredientsApi";

import { useHomeDashboard } from "hooks/useHomeDashboard";

import { mockGetByUrl } from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

const RECENT_RECIPES_PARAMS = {};

// local YYYY-MM-DD string for "n days from now" - avoids UTC round-trip drift
const daysFromNow = (days: number): string => {
    const date = new Date();

    date.setDate(date.getDate() + days);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const RECIPE_1: RecipeWithIngredientNames = {
    id: 1,
    title: "Borscht",
    type_name: "Soup",
    creation_date: "2024-01-01",
    cooking_time: 60,
    ingredients: ["beet"],
};

const MENU_1: Menu = {
    id: 1,
    title: "Weekday menu",
    categoryname: "Lunch",
    menucontent: "quick",
    recipe_count: 3,
};

const EXPIRED_INGREDIENT: UserIngredient = {
    ingredient_id: 1,
    ingredient_slug: "milk",
    ingredient_name: "Milk",
    category: "dairy",
    unit_name: "l",
    quantity_person_ingradient: 1,
    days_to_expire: 5,
    allergens: ["milk"],
    purchase_date: daysFromNow(-10),
    lots: [],
};
const SOON_INGREDIENT: UserIngredient = {
    ingredient_id: 2,
    ingredient_slug: "eggs",
    ingredient_name: "Eggs",
    category: "eggs",
    unit_name: "piece",
    quantity_person_ingradient: 6,
    days_to_expire: 5,
    allergens: ["eggs"],
    purchase_date: daysFromNow(-3),
    lots: [],
};
const FRESH_INGREDIENT: UserIngredient = {
    ingredient_id: 3,
    ingredient_slug: "flour",
    ingredient_name: "Flour",
    category: "flour_baking",
    unit_name: "kg",
    quantity_person_ingradient: 1,
    days_to_expire: 60,
    allergens: ["gluten"],
    purchase_date: daysFromNow(0),
    lots: [],
};
const NO_EXPIRY_DATA_INGREDIENT: UserIngredient = {
    ingredient_id: 4,
    ingredient_slug: "salt",
    ingredient_name: "Salt",
    category: "spices",
    unit_name: "kg",
    quantity_person_ingradient: 1,
    allergens: [],
    lots: [],
};

const setup = async (
    recentRecipes: RecipeListItem[] = [RECIPE_1],
    pantry: UserIngredient[] = [],
) => {
    mockGetByUrl({
        [API_ROUTES.recipes.list]: [RECIPE_1],
        [API_ROUTES.recipes.byPerson]: {
            items: recentRecipes,
            total: recentRecipes.length,
        },
        [API_ROUTES.menu.allUnpaginated]: [MENU_1],
        [API_ROUTES.userIngredients.list]: pantry,
    });

    const store = makeTestStore();

    await Promise.all([
        store.dispatch(recipesApi.endpoints.getAllRecipes.initiate(null)),
        store.dispatch(
            recipesApi.endpoints.getRecipesByPerson.initiate(
                RECENT_RECIPES_PARAMS,
            ),
        ),
        store.dispatch(menusApi.endpoints.getAllMenus.initiate(null)),
        store.dispatch(
            userIngredientsApi.endpoints.getUserIngredients.initiate(null),
        ),
    ]);

    return renderHookWithStore(() => useHomeDashboard(), store);
};

describe("useHomeDashboard", () => {
    it("should aggregate recipe, menu and pantry counts from the shared caches", async () => {
        const { result } = await setup([RECIPE_1], [FRESH_INGREDIENT]);

        expect(result.current.recipesCount).toBe(1);
        expect(result.current.menusCount).toBe(1);
        expect(result.current.pantryCount).toBe(1);
        expect(result.current.isLoading).toBe(false);
    });

    it("should flatten the recent recipes from the infinite query pages", async () => {
        const { result } = await setup([RECIPE_1]);

        expect(result.current.recentRecipes).toEqual([RECIPE_1]);
    });

    it("should sort urgent pantry ingredients by nearest expiry and exclude fresh or no-data ones", async () => {
        const { result } = await setup(
            [RECIPE_1],
            [
                FRESH_INGREDIENT,
                SOON_INGREDIENT,
                EXPIRED_INGREDIENT,
                NO_EXPIRY_DATA_INGREDIENT,
            ],
        );

        expect(result.current.expiringSoon.map((item) => item.name)).toEqual([
            EXPIRED_INGREDIENT.ingredient_name,
            SOON_INGREDIENT.ingredient_name,
        ]);
        expect(result.current.expiringSoonCount).toBe(2);
    });

    it("should report the true urgent count even when it exceeds the displayed list", async () => {
        const urgentPantry = [
            EXPIRED_INGREDIENT,
            SOON_INGREDIENT,
            { ...SOON_INGREDIENT, ingredient_id: 5, ingredient_name: "Yogurt" },
            { ...SOON_INGREDIENT, ingredient_id: 6, ingredient_name: "Cheese" },
            { ...SOON_INGREDIENT, ingredient_id: 7, ingredient_name: "Cream" },
            { ...SOON_INGREDIENT, ingredient_id: 8, ingredient_name: "Butter" },
        ];

        const { result } = await setup([RECIPE_1], urgentPantry);

        expect(result.current.expiringSoonCount).toBe(6);
        expect(result.current.expiringSoon).toHaveLength(5);
    });

    it("should report loading before every cache has resolved", () => {
        mockGetByUrl({
            [API_ROUTES.recipes.list]: [RECIPE_1],
            [API_ROUTES.recipes.byPerson]: { items: [], total: 0 },
            [API_ROUTES.menu.allUnpaginated]: [],
            [API_ROUTES.userIngredients.list]: [],
        });

        const { result } = renderHookWithStore(() => useHomeDashboard());

        expect(result.current.isLoading).toBe(true);
    });

    it("should report an error when a query fails", async () => {
        mockGetByUrl({
            [API_ROUTES.recipes.list]: [RECIPE_1],
            [API_ROUTES.recipes.byPerson]: { items: [], total: 0 },
            [API_ROUTES.menu.allUnpaginated]: [],
        });

        const store = makeTestStore();

        await Promise.all([
            store.dispatch(recipesApi.endpoints.getAllRecipes.initiate(null)),
            store.dispatch(
                recipesApi.endpoints.getRecipesByPerson.initiate(
                    RECENT_RECIPES_PARAMS,
                ),
            ),
            store.dispatch(menusApi.endpoints.getAllMenus.initiate(null)),
            store.dispatch(
                userIngredientsApi.endpoints.getUserIngredients.initiate(null),
            ),
        ]);

        const { result } = renderHookWithStore(() => useHomeDashboard(), store);

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.isError).toBe(true);
    });
});
