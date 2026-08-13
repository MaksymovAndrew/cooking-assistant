import type { Pool } from "pg";

import type {
    AverageCookingTime,
    RecipeCalorieEntry,
    RecipeIngredientCountEntry,
    RecipeStatisticsDto,
    RecipeTimeEntry,
    RecipeTypeStat,
} from "domain/repositories/recipeStats.types";

const EXTREMES_LIMIT = 3;
// effective per-portion calories: the author's manual value wins, otherwise the ingredient total
const CALORIES_PER_PORTION_SQL =
    "COALESCE(r.calories_override, r.calories_computed)";

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
        { rows: fastestRecipes },
        { rows: slowestRecipes },
        { rows: mostIngredientsRecipes },
        { rows: leastIngredientsRecipes },
        { rows: mostCaloricRecipes },
        { rows: leastCaloricRecipes },
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
        pool.query<RecipeTimeEntry>(
            `SELECT r.id, r.title, r.cooking_time AS "cookingTime"
             FROM recipes r
             ORDER BY r.cooking_time ASC, r.id ASC
             LIMIT ${EXTREMES_LIMIT}`,
        ),
        pool.query<RecipeTimeEntry>(
            `SELECT r.id, r.title, r.cooking_time AS "cookingTime"
             FROM recipes r
             ORDER BY r.cooking_time DESC, r.id ASC
             LIMIT ${EXTREMES_LIMIT}`,
        ),
        pool.query<RecipeIngredientCountEntry>(
            `SELECT r.id, r.title, COUNT(ri.ingredient_id)::int AS "ingredientCount"
             FROM recipes r
                    JOIN recipe_ingredients ri ON r.id = ri.recipe_id
             GROUP BY r.id, r.title
             ORDER BY "ingredientCount" DESC, r.id ASC
             LIMIT ${EXTREMES_LIMIT}`,
        ),
        pool.query<RecipeIngredientCountEntry>(
            `SELECT r.id, r.title, COUNT(ri.ingredient_id)::int AS "ingredientCount"
             FROM recipes r
                    JOIN recipe_ingredients ri ON r.id = ri.recipe_id
             GROUP BY r.id, r.title
             ORDER BY "ingredientCount" ASC, r.id ASC
             LIMIT ${EXTREMES_LIMIT}`,
        ),
        pool.query<RecipeCalorieEntry>(
            `SELECT r.id, r.title, ${CALORIES_PER_PORTION_SQL} AS "caloriesPerPortion"
             FROM recipes r
             WHERE ${CALORIES_PER_PORTION_SQL} IS NOT NULL
             ORDER BY "caloriesPerPortion" DESC, r.id ASC
             LIMIT ${EXTREMES_LIMIT}`,
        ),
        pool.query<RecipeCalorieEntry>(
            `SELECT r.id, r.title, ${CALORIES_PER_PORTION_SQL} AS "caloriesPerPortion"
             FROM recipes r
             WHERE ${CALORIES_PER_PORTION_SQL} IS NOT NULL
             ORDER BY "caloriesPerPortion" ASC, r.id ASC
             LIMIT ${EXTREMES_LIMIT}`,
        ),
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
