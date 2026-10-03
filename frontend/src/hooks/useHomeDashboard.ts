import { useMemo } from "react";

import type { ExpiringIngredient } from "types/expiry";
import type { RecipeSearchResultItem } from "types/recipe";

import {
    flattenPages,
    getPaginatedTotal,
} from "redux/services/infiniteQueryHelpers";
import { useGetMenusByPersonInfiniteQuery } from "redux/services/menusApi";
import {
    useGetRecipesByFiltersInfiniteQuery,
    useGetRecipesByPersonInfiniteQuery,
} from "redux/services/recipesApi";
import { useGetUserIngredientsQuery } from "redux/services/userIngredientsApi";

import { useCalorieBudget } from "hooks/useCalorieBudget";

import { roundCalories } from "utils/calories";
import { getExpiryStatus } from "utils/expiry";

// the desktop's 3x3; smaller screens crop the same nine in CSS, so there is only one request
const RECENT_RECIPES_LIMIT = 9;
const EXPIRING_SOON_LIMIT = 5;
// omitting sort_order falls back to the backend's creation_date DESC
const RECENT_RECIPES_PARAMS = {};
// the counters read the first page's total, so the whole list is never downloaded to count it
const MY_MENUS_PARAMS = {};
const COOKABLE_RECIPES_PARAMS = { in_pantry: true };

const byNearestExpiry = (a: ExpiringIngredient, b: ExpiringIngredient) =>
    a.status.days - b.status.days;

const isExpiringIngredient = (
    item: ExpiringIngredient | null,
): item is ExpiringIngredient => item !== null;

export const useHomeDashboard = () => {
    const pantry = useGetUserIngredientsQuery(null);
    const recent = useGetRecipesByPersonInfiniteQuery(RECENT_RECIPES_PARAMS);
    const myMenus = useGetMenusByPersonInfiniteQuery(MY_MENUS_PARAMS);
    const pantryCount = pantry.data?.length ?? 0;
    const cookable = useGetRecipesByFiltersInfiniteQuery(
        COOKABLE_RECIPES_PARAMS,
        { skip: pantryCount === 0 },
    );
    const calorieBudget = useCalorieBudget();

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

    const isLoading = myMenus.isLoading || pantry.isLoading || recent.isLoading;

    const isError = myMenus.isError || pantry.isError || recent.isError;

    return {
        recipesCount: getPaginatedTotal(recent.data),
        menusCount: getPaginatedTotal(myMenus.data),
        pantryCount,
        // null until known, so the card never claims "none" while the count is on its way
        cookableRecipesCount: cookable.data
            ? getPaginatedTotal(cookable.data)
            : null,
        expiringSoonCount: urgentIngredients.length,
        expiringSoon: urgentIngredients.slice(0, EXPIRING_SOON_LIMIT),
        // the card lists five, but restocking covers every urgent ingredient the counter reports
        allExpiringSoon: urgentIngredients,
        kcalToday: roundCalories(calorieBudget.consumed),
        kcalGoal: calorieBudget.goal,
        calorieRemaining: calorieBudget.remaining,
        recentRecipes,
        isLoading,
        isError,
    };
};
