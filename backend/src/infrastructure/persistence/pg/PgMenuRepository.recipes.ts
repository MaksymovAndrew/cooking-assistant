import type { Pool } from "pg";

import type { Locale } from "constants/locales";
import type { RecordRating } from "domain/repositories/recordAuthor";

import { ratingSummaryColumns } from "infrastructure/persistence/pg/ratingColumns";

export interface MenuRecipeRow extends Omit<RecordRating, "myRating"> {
    recipe_id: number;
    title: string;
    content: string;
    language: Locale;
    type_id: number | null;
    creation_date: Date;
    cooking_time: number | null;
    calories_per_portion: number | null;
    type_name: string | null;
    photo_key: string | null;
    ingredients: string[];
}

export async function loadMenuRecipes(
    pool: Pool,
    menuId: string | number,
): Promise<MenuRecipeRow[]> {
    const result = await pool.query<MenuRecipeRow>(
        `SELECT
        r.id AS recipe_id,
        r.title,
        r.content,
        r.language,
        r.type_id,
        r.creation_date,
        r.cooking_time,
        r.photo_key,
        ${ratingSummaryColumns("r")},
        COALESCE(r.calories_override, r.calories_computed) AS calories_per_portion,
        rt.type_name AS type_name,
        ARRAY_AGG(i.name) AS ingredients
      FROM recipes r
      JOIN menu_recipe mr ON r.id = mr.recipe_id
      LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
      LEFT JOIN ingredients i ON i.id = ri.ingredient_id
      LEFT JOIN recipe_types rt ON rt.id = r.type_id
      WHERE mr.menu_id = $1
      GROUP BY r.id, rt.type_name`,
        [menuId],
    );

    return result.rows;
}
