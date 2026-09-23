import type { Pool } from "pg";

import type {
    RecipeCalorieEntry,
    RecipeIngredientCountEntry,
    RecipeTimeEntry,
} from "domain/repositories/recipeStats.types";

// interpolated, never bound: a fixed literal type, so no request value can reach the SQL
type SortDirection = "ASC" | "DESC";

const EXTREMES_LIMIT = 3;

// effective per-portion calories: the author's manual value wins, otherwise the ingredient total
export const CALORIES_PER_PORTION_SQL =
    "COALESCE(r.calories_override, r.calories_computed)";

export async function cookingTimeExtremes(
    pool: Pool,
    direction: SortDirection,
): Promise<RecipeTimeEntry[]> {
    const result = await pool.query<RecipeTimeEntry>(
        `SELECT r.id, r.title, r.cooking_time AS "cookingTime"
         FROM recipes r
         ORDER BY r.cooking_time ${direction}, r.id ASC
         LIMIT ${EXTREMES_LIMIT}`,
    );

    return result.rows;
}

export async function ingredientCountExtremes(
    pool: Pool,
    direction: SortDirection,
): Promise<RecipeIngredientCountEntry[]> {
    const result = await pool.query<RecipeIngredientCountEntry>(
        `SELECT r.id, r.title, COUNT(ri.ingredient_id)::int AS "ingredientCount"
         FROM recipes r
                JOIN recipe_ingredients ri ON r.id = ri.recipe_id
         GROUP BY r.id, r.title
         ORDER BY "ingredientCount" ${direction}, r.id ASC
         LIMIT ${EXTREMES_LIMIT}`,
    );

    return result.rows;
}

export async function calorieExtremes(
    pool: Pool,
    direction: SortDirection,
): Promise<RecipeCalorieEntry[]> {
    const result = await pool.query<RecipeCalorieEntry>(
        `SELECT r.id, r.title, ${CALORIES_PER_PORTION_SQL} AS "caloriesPerPortion"
         FROM recipes r
         WHERE ${CALORIES_PER_PORTION_SQL} IS NOT NULL
         ORDER BY "caloriesPerPortion" ${direction}, r.id ASC
         LIMIT ${EXTREMES_LIMIT}`,
    );

    return result.rows;
}
