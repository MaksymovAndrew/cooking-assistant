import type { Pool } from "pg";

import type {
    CookRequirement,
    CookSource,
} from "domain/repositories/PantryConsumptionRepository";

const REQUIREMENT_COLUMNS = `ri.ingredient_id, i.slug, i.name, um.unit_name`;
const REQUIREMENT_JOINS = `JOIN ingredients i ON i.id = ri.ingredient_id
         JOIN unit_measurement um ON um.id = i.id_unit_measurement`;

// a menu cooks each of its recipes once, so a recipe listed twice is not counted twice
export async function findCookRequirements(
    pool: Pool,
    source: CookSource,
): Promise<CookRequirement[]> {
    if ("recipeId" in source) {
        const result = await pool.query<CookRequirement>(
            `SELECT ${REQUIREMENT_COLUMNS}, ri.quantity_recipe_ingredients AS quantity
             FROM recipe_ingredients ri
             ${REQUIREMENT_JOINS}
             WHERE ri.recipe_id = $1
             ORDER BY i.name, ri.ingredient_id`,
            [source.recipeId],
        );

        return result.rows;
    }

    const result = await pool.query<CookRequirement>(
        `SELECT ${REQUIREMENT_COLUMNS}, SUM(ri.quantity_recipe_ingredients) AS quantity
         FROM (SELECT DISTINCT recipe_id FROM menu_recipe WHERE menu_id = $1) mr
         JOIN recipe_ingredients ri ON ri.recipe_id = mr.recipe_id
         ${REQUIREMENT_JOINS}
         GROUP BY ri.ingredient_id, i.slug, i.name, um.unit_name
         ORDER BY i.name, ri.ingredient_id`,
        [source.menuId],
    );

    return result.rows;
}
