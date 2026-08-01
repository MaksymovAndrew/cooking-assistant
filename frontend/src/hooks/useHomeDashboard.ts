import { useMemo } from "react";

import type { ExpiringIngredient } from "types/expiry";
import type { RecipeSearchResultItem } from "types/recipe";

import { flattenPages } from "redux/services/infiniteQueryHelpers";
import { useGetAllMenusQuery } from "redux/services/menusApi";
import {
    useGetAllRecipesQuery,
    useGetRecipesByPersonInfiniteQuery,
} from "redux/services/recipesApi";
import { useGetUserIngredientsQuery } from "redux/services/userIngredientsApi";

import { getExpiryStatus } from "utils/expiry";

// fetched once at the desktop count (3x3); tablet/mobile crop the same 9 down to 4/2 via CSS (nth-child), so there's only ever one request
const RECENT_RECIPES_LIMIT = 9;
const EXPIRING_SOON_LIMIT = 5;
// omitting sort_order falls back to the backend's creation_date DESC
const RECENT_RECIPES_PARAMS = {};

const byNearestExpiry = (a: ExpiringIngredient, b: ExpiringIngredient) =>
    a.status.days - b.status.days;

const isExpiringIngredient = (
    item: ExpiringIngredient | null,
): item is ExpiringIngredient => item !== null;

export const useHomeDashboard = () => {
    const allRecipes = useGetAllRecipesQuery(null);
    const allMenus = useGetAllMenusQuery(null);
    const pantry = useGetUserIngredientsQuery(null);
    const recent = useGetRecipesByPersonInfiniteQuery(RECENT_RECIPES_PARAMS);

    const recentRecipes = useMemo<RecipeSearchResultItem[]>(
        () => flattenPages(recent.data).slice(0, RECENT_RECIPES_LIMIT),
        [recent.data],
    );

    const urgentIngredients = useMemo<ExpiringIngredient[]>(() => {
        const ingredients = pantry.data ?? [];

        return ingredients
            .map((ingredient) => {
                const status = getExpiryStatus(
                    ingredient.days_to_expire,
                    ingredient.purchase_date,
                );

                return status && status.tone !== "ok"
                    ? {
                          ingredientId: ingredient.ingredient_id,
                          slug: ingredient.ingredient_slug,
                          name: ingredient.ingredient_name,
                          status,
                      }
                    : null;
            })
            .filter(isExpiringIngredient)
            .sort(byNearestExpiry);
    }, [pantry.data]);

    const isLoading =
        allRecipes.isLoading ||
        allMenus.isLoading ||
        pantry.isLoading ||
        recent.isLoading;

    const isError =
        allRecipes.isError ||
        allMenus.isError ||
        pantry.isError ||
        recent.isError;

    return {
        recipesCount: allRecipes.data?.length ?? 0,
        menusCount: allMenus.data?.length ?? 0,
        pantryCount: pantry.data?.length ?? 0,
        expiringSoonCount: urgentIngredients.length,
        expiringSoon: urgentIngredients.slice(0, EXPIRING_SOON_LIMIT),
        recentRecipes,
        isLoading,
        isError,
    };
};
