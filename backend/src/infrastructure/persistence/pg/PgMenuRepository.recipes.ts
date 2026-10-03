import type { Pool } from "pg";

import type { MenuRecipeRow } from "domain/repositories/menu.types";

import { caloriesPerPortion } from "./calorieColumns";
import { ratingSummaryColumns } from "./ratingColumns";

export async function loadMenuRecipes(
    pool: Pool,
    menuId: number,
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
        ${caloriesPerPortion("r")} AS calories_per_portion,
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
