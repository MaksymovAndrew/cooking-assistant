import type { Pool } from "pg";

import type {
    AverageCookingTime,
    RecipeStatisticsDto,
    RecipeTypeStat,
} from "domain/repositories/recipeStats.types";

import {
    calorieExtremes,
    CALORIES_PER_PORTION_SQL,
    cookingTimeExtremes,
    ingredientCountExtremes,
} from "./PgRecipeRepository.extremes";

interface OverallRow {
    recipesCount: number;
    averageCookingTimeOverall: number | null;
    averageCaloriesOverall: number | null;
}

function findMostUsed(stats: RecipeTypeStat[]): RecipeTypeStat | null {
    return stats.reduce<RecipeTypeStat | null>(
        (best, stat) => (!best || stat.count > best.count ? stat : best),
        null,
    );
}

export async function getRecipeStats(pool: Pool): Promise<RecipeStatisticsDto> {
    // every aggregate below is independent, so run them in parallel
    const [
        { rows: overallRows },
        { rows: stats },
        { rows: averageCookingTimesByType },
        fastestRecipes,
        slowestRecipes,
        mostIngredientsRecipes,
        leastIngredientsRecipes,
        mostCaloricRecipes,
        leastCaloricRecipes,
    ] = await Promise.all([
        pool.query<OverallRow>(
            `SELECT COUNT(*)::int AS "recipesCount",
                    ROUND(AVG(r.cooking_time))::int AS "averageCookingTimeOverall",
                    ROUND(AVG(${CALORIES_PER_PORTION_SQL}))::int AS "averageCaloriesOverall"
             FROM recipes r`,
        ),
        pool.query<RecipeTypeStat>(
            `SELECT rt.type_name AS "typeName", COUNT(*)::int AS count
             FROM recipes r
                    JOIN recipe_types rt ON r.type_id = rt.id
             GROUP BY rt.type_name`,
        ),
        pool.query<AverageCookingTime>(
            `SELECT rt.type_name AS "typeName",
                    ROUND(AVG(r.cooking_time))::int AS "averageCookingTime"
             FROM recipes r
                    JOIN recipe_types rt ON r.type_id = rt.id
             GROUP BY rt.type_name`,
        ),
        cookingTimeExtremes(pool, "ASC"),
        cookingTimeExtremes(pool, "DESC"),
        ingredientCountExtremes(pool, "DESC"),
        ingredientCountExtremes(pool, "ASC"),
        calorieExtremes(pool, "DESC"),
        calorieExtremes(pool, "ASC"),
    ]);
    const overall = overallRows[0];

    return {
        stats,
        recipesCount: overall.recipesCount,
        averageCookingTimeOverall: overall.averageCookingTimeOverall,
        averageCookingTimesByType,
        mostUsedType: findMostUsed(stats),
        fastestRecipes,
        slowestRecipes,
        mostIngredientsRecipes,
        leastIngredientsRecipes,
        averageCaloriesOverall: overall.averageCaloriesOverall,
        mostCaloricRecipes,
        leastCaloricRecipes,
    };
}
