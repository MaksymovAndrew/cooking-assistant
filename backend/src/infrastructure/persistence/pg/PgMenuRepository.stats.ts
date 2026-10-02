import type { Pool } from "pg";

import type { MenuStatsRow } from "domain/repositories/menu.types";

import { menuCaloriesTotal } from "./calorieColumns";
import { MENU_ORDER_BY } from "./PgMenuRepository.queries";

// unbounded, no filters/pagination - the statistics page needs every menu (incl. recipe count/total cooking time) for the averages and extremes
export async function findAllMenusUnpaginated(
    pool: Pool,
): Promise<MenuStatsRow[]> {
    const result = await pool.query<MenuStatsRow>(`
      SELECT
        m.menu_id AS id,
        m.menu_title AS title,
        mc.category_name AS "categoryName",
        m.menu_content AS "menuContent",
        COUNT(mr.recipe_id)::int AS recipe_count,
        COALESCE(SUM(r.cooking_time), 0)::int AS total_cooking_time,
        ${menuCaloriesTotal("r")} AS total_calories
      FROM menu m
             LEFT JOIN menu_category mc ON m.category_id = mc.menu_category_id
             LEFT JOIN menu_recipe mr ON mr.menu_id = m.menu_id
             LEFT JOIN recipes r ON r.id = mr.recipe_id
      GROUP BY m.menu_id, mc.category_name
      ${MENU_ORDER_BY}
    `);

    return result.rows;
}
