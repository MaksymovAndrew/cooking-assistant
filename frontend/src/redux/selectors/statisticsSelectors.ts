import { createSelector } from "@reduxjs/toolkit";

import type { Menu } from "types/menu";
import type { RecipeWithIngredientNames } from "types/recipe";
import type {
    AverageCookingTime,
    MenuStatistics,
    RecipeStatistics,
    RecipeTypeStat,
} from "types/stats";

import { menusApi } from "redux/services/menusApi";
import { recipesApi } from "redux/services/recipesApi";

import { formatCookingTimeInput } from "utils/cookingTimeUtils";

// derives from the same RTK Query caches the lists use - no dedicated stats request needed
const computeRecipeStatistics = (
    recipes: RecipeWithIngredientNames[],
): RecipeStatistics => {
    const typeCounts: Record<string, number> = {};

    recipes.forEach((recipe) => {
        typeCounts[recipe.type_name] = (typeCounts[recipe.type_name] || 0) + 1;
    });

    const stats: RecipeTypeStat[] = Object.keys(typeCounts).map((typeName) => ({
        typeName,
        count: typeCounts[typeName],
    }));

    if (recipes.length === 0) {
        return {
            stats,
            recipesCount: 0,
            fastestRecipes: [],
            slowestRecipes: [],
            mostIngredientsRecipes: [],
            leastIngredientsRecipes: [],
        };
    }

    const times = recipes.map((recipe) => recipe.cooking_time);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    const ingredientCounts = recipes.map((recipe) => recipe.ingredients.length);
    const maxIngredients = Math.max(...ingredientCounts);
    const minIngredients = Math.min(...ingredientCounts);

    return {
        stats,
        recipesCount: recipes.length,
        fastestRecipes: recipes.filter(
            (recipe) => recipe.cooking_time === minTime,
        ),
        slowestRecipes: recipes.filter(
            (recipe) => recipe.cooking_time === maxTime,
        ),
        mostIngredientsRecipes: recipes.filter(
            (recipe) => recipe.ingredients.length === maxIngredients,
        ),
        leastIngredientsRecipes: recipes.filter(
            (recipe) => recipe.ingredients.length === minIngredients,
        ),
    };
};

const computeAverageCookingTimes = (
    recipes: RecipeWithIngredientNames[],
): AverageCookingTime[] => {
    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};

    recipes.forEach((recipe) => {
        sums[recipe.type_name] =
            (sums[recipe.type_name] || 0) + recipe.cooking_time;
        counts[recipe.type_name] = (counts[recipe.type_name] || 0) + 1;
    });

    return Object.keys(sums).map((typeName) => ({
        typeName,
        averageCookingTime: formatCookingTimeInput(
            Math.round(sums[typeName] / counts[typeName]),
        ),
    }));
};

const computeMenuStatistics = (
    menus: Menu[],
    recipes: RecipeWithIngredientNames[],
): MenuStatistics => {
    const categoryCounts: Record<string, number> = {};

    menus.forEach((menu) => {
        categoryCounts[menu.categoryname] =
            (categoryCounts[menu.categoryname] || 0) + 1;
    });

    return {
        menusCount: menus.length,
        recipesCount: recipes.length,
        averageCookingTimes: computeAverageCookingTimes(recipes),
        menuCountByCategory: Object.entries(categoryCounts).map(
            ([categoryname, menuCount]) => ({ categoryname, menuCount }),
        ),
    };
};

// no-arg list caches the stats page also subscribes to via the query hooks
const selectAllRecipesResult = recipesApi.endpoints.getAllRecipes.select(null);
const selectMenusResult = menusApi.endpoints.getAllMenus.select(null);

const selectAllRecipes = createSelector(
    selectAllRecipesResult,
    (result): RecipeWithIngredientNames[] => result.data ?? [],
);

const selectAllMenus = createSelector(
    selectMenusResult,
    (result): Menu[] => result.data ?? [],
);

export const selectRecipeStatistics = createSelector(
    selectAllRecipes,
    computeRecipeStatistics,
);

export const selectMenuStatistics = createSelector(
    selectAllMenus,
    selectAllRecipes,
    computeMenuStatistics,
);
