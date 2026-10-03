import type { Pool } from "pg";

import type {
    AverageCookingTime,
    RecipeCalorieEntry,
    RecipeIngredientCountEntry,
    RecipeStatisticsDto,
    RecipeTimeEntry,
    RecipeTypeBucket,
    RecipeTypeStat,
} from "domain/repositories/recipeStats.types";

import { caloriesPerPortion } from "./calorieColumns";

// interpolated, never bound: fixed literals, so no request value can reach the SQL
type SortDirection = "ASC" | "DESC";
type SummaryColumn = "cookingTime" | "ingredientCount" | "caloriesPerPortion";

const EXTREMES_LIMIT = 3;

const RECIPE_SUMMARY = `
    WITH summary AS (
        SELECT r.id,
               r.title,
               rt.type_name AS "typeName",
               r.cooking_time AS "cookingTime",
               ri."ingredientCount",
               ${caloriesPerPortion("r")} AS "caloriesPerPortion"
        FROM recipes r
                 LEFT JOIN recipe_types rt ON rt.id = r.type_id
                 LEFT JOIN (
                     SELECT recipe_id, COUNT(*)::int AS "ingredientCount"
                     FROM recipe_ingredients
                     GROUP BY recipe_id
                 ) ri ON ri.recipe_id = r.id
    ),
    type_stats AS (
        SELECT "typeName",
               COUNT(*)::int AS count,
               ROUND(AVG("cookingTime"))::int AS "averageCookingTime"
        FROM summary
        GROUP BY "typeName"
    )`;

// a recipe without the figure stays out - DESC would otherwise rank its NULL first
function extremes(column: SummaryColumn, direction: SortDirection): string {
    return `(
        SELECT COALESCE(json_agg(e ORDER BY e."${column}" ${direction}, e.id), '[]')
        FROM (
            SELECT id, title, "${column}" FROM summary
            WHERE "${column}" IS NOT NULL
            ORDER BY "${column}" ${direction}, id
            LIMIT ${EXTREMES_LIMIT}
        ) e
    )`;
}

interface TypeStatRow extends RecipeTypeBucket {
    averageCookingTime: number | null;
}

interface StatsRow {
    recipesCount: number;
    averageCookingTimeOverall: number | null;
    averageCaloriesOverall: number | null;
    typeStats: TypeStatRow[];
    fastestRecipes: RecipeTimeEntry[];
    slowestRecipes: RecipeTimeEntry[];
    mostIngredientsRecipes: RecipeIngredientCountEntry[];
    leastIngredientsRecipes: RecipeIngredientCountEntry[];
    mostCaloricRecipes: RecipeCalorieEntry[];
    leastCaloricRecipes: RecipeCalorieEntry[];
}

// averages are per real type, and a type with no cooking times has none to show
function averageTimesByType(typeStats: TypeStatRow[]): AverageCookingTime[] {
    return typeStats.flatMap(({ typeName, averageCookingTime }) =>
        typeName === null || averageCookingTime === null
            ? []
            : [{ typeName, averageCookingTime }],
    );
}

function typedOnly(typeStats: TypeStatRow[]): RecipeTypeStat[] {
    return typeStats.flatMap(({ typeName, count }) =>
        typeName === null ? [] : [{ typeName, count }],
    );
}

export async function getRecipeStats(pool: Pool): Promise<RecipeStatisticsDto> {
    const result = await pool.query<StatsRow>(`
        ${RECIPE_SUMMARY}
        SELECT
            (SELECT COUNT(*)::int FROM summary) AS "recipesCount",
            (SELECT ROUND(AVG("cookingTime"))::int FROM summary) AS "averageCookingTimeOverall",
            (SELECT ROUND(AVG("caloriesPerPortion"))::int FROM summary) AS "averageCaloriesOverall",
            (SELECT COALESCE(json_agg(t ORDER BY t."typeName" IS NULL, t.count DESC, t."typeName"), '[]')
             FROM type_stats t) AS "typeStats",
            ${extremes("cookingTime", "ASC")} AS "fastestRecipes",
            ${extremes("cookingTime", "DESC")} AS "slowestRecipes",
            ${extremes("ingredientCount", "DESC")} AS "mostIngredientsRecipes",
            ${extremes("ingredientCount", "ASC")} AS "leastIngredientsRecipes",
            ${extremes("caloriesPerPortion", "DESC")} AS "mostCaloricRecipes",
            ${extremes("caloriesPerPortion", "ASC")} AS "leastCaloricRecipes"
    `);
    const { typeStats, ...aggregates } = result.rows[0];

    return {
        ...aggregates,
        stats: typeStats.map(({ typeName, count }) => ({ typeName, count })),
        // most used first, and "no type" is not a type to name as the most used
        mostUsedType: typedOnly(typeStats).at(0) ?? null,
        averageCookingTimesByType: averageTimesByType(typeStats),
    };
}
