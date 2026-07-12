import type { RecipeWithIngredientNames } from "types/recipe";
import type {
    AverageCookingTime,
    RecipeStatistics,
    RecipeTypeStat,
} from "types/stats";

import { averageByGroup, findExtremes, findMostUsed } from "./statsHelpers";

const computeAverageCookingTimes = (
    recipes: RecipeWithIngredientNames[],
): AverageCookingTime[] =>
    averageByGroup(
        recipes,
        (recipe) => recipe.type_name,
        (recipe) => recipe.cooking_time,
    ).map(({ group, average }) => ({
        typeName: group,
        averageCookingTime: average,
    }));

// derives from the same RTK Query caches the lists use - no dedicated stats request needed
export const computeRecipeStatistics = (
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
            averageCookingTimeOverall: null,
            averageCookingTimesByType: [],
            mostUsedType: null,
            fastestRecipes: [],
            slowestRecipes: [],
            mostIngredientsRecipes: [],
            leastIngredientsRecipes: [],
        };
    }

    const totalTime = recipes.reduce((sum, r) => sum + r.cooking_time, 0);
    const timeExtremes = findExtremes(recipes, (r) => r.cooking_time);
    const ingredientExtremes = findExtremes(
        recipes,
        (r) => r.ingredients.length,
    );

    return {
        stats,
        recipesCount: recipes.length,
        averageCookingTimeOverall: Math.round(totalTime / recipes.length),
        averageCookingTimesByType: computeAverageCookingTimes(recipes),
        mostUsedType: findMostUsed(stats, (stat) => stat.count),
        fastestRecipes: timeExtremes.min,
        slowestRecipes: timeExtremes.max,
        mostIngredientsRecipes: ingredientExtremes.max,
        leastIngredientsRecipes: ingredientExtremes.min,
    };
};
