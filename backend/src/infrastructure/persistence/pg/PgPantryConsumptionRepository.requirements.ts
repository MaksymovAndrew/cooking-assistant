import type { Pool } from "pg";

import type { CookRequirement } from "domain/repositories/PantryConsumptionRepository";
import type { RecordSource } from "domain/repositories/recordSource";

const REQUIREMENT_COLUMNS = `ri.ingredient_id, i.slug, i.name, um.unit_name`;
const REQUIREMENT_JOINS = `JOIN ingredients i ON i.id = ri.ingredient_id
         JOIN unit_measurement um ON um.id = i.id_unit_measurement`;

// a menu holds each recipe once (a unique key), so summing its recipes gives one cooking of the menu
export async function findCookRequirements(
    pool: Pool,
    source: RecordSource,
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
         FROM menu_recipe mr
         JOIN recipe_ingredients ri ON ri.recipe_id = mr.recipe_id
         ${REQUIREMENT_JOINS}
         WHERE mr.menu_id = $1
         GROUP BY ri.ingredient_id, i.slug, i.name, um.unit_name
         ORDER BY i.name, ri.ingredient_id`,
        [source.menuId],
    );

    return result.rows;
}
