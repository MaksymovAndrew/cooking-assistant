import type { Pool } from "pg";

import { MENU_ORDER_BY } from "./PgMenuRepository.queries";

interface MenuRow {
    id: number;
    title: string;
    categoryName: string;
    menuContent: string;
    recipe_count: number;
    total_cooking_time: number;
    total_calories: number | null;
}

// unbounded, no filters/pagination - the statistics page needs every menu (incl. recipe count/total cooking time) for the averages and extremes
export async function findAllMenusUnpaginated(pool: Pool): Promise<unknown[]> {
    const result = await pool.query<MenuRow>(`
      SELECT
        m.menu_id AS id,
        m.menu_title AS title,
        mc.category_name AS categoryName,
        m.menu_content AS menuContent,
        COUNT(mr.recipe_id)::int AS recipe_count,
        COALESCE(SUM(r.cooking_time), 0)::int AS total_cooking_time,
        -- null (not a silently undercounted number) once any of the menu's recipes lacks calorie data - same rule PgCalorieRepository.findMenuCalories already uses for a single menu
        CASE
          WHEN bool_or(r.id IS NOT NULL AND COALESCE(r.calories_override, r.calories_computed) IS NULL)
            THEN NULL
          ELSE SUM(COALESCE(r.calories_override, r.calories_computed))
        END AS total_calories
      FROM menu m
             LEFT JOIN menu_category mc ON m.category_id = mc.menu_category_id
             LEFT JOIN menu_recipe mr ON mr.menu_id = m.menu_id
             LEFT JOIN recipes r ON r.id = mr.recipe_id
      GROUP BY m.menu_id, mc.category_name
      ${MENU_ORDER_BY}
    `);

    return result.rows;
}
