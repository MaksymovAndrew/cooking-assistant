import type { Pool } from "pg";

interface MissingIngredientRow {
    recipe_id: number;
    ingredient_id: number;
    ingredient_slug: string;
    ingredient_name: string;
    needed_quantity: number;
    missing_quantity: number;
    unit_name: string;
    coefficient: number;
}

export interface MissingIngredient {
    ingredient_id: number;
    ingredient_slug: string;
    ingredient_name: string;
    needed_quantity: number;
    missing_quantity: number;
    unit_name: string;
    coefficient: number;
}

// one query for every recipe of the menu, then grouped in memory - skipped for a guest
// (personId null): joining pi.person_id = NULL would match no pantry rows, so every ingredient
// would come back as fully missing instead of "unknown, show nothing"
export async function loadMissingIngredients(
    pool: Pool,
    recipeIds: number[],
    personId: number | null,
): Promise<Map<number, MissingIngredient[]>> {
    const missingByRecipe = new Map<number, MissingIngredient[]>();

    if (recipeIds.length === 0 || personId === null) {
        return missingByRecipe;
    }

    const missingResult = await pool.query<MissingIngredientRow>(
        `SELECT
      ri.recipe_id,
      i.id AS ingredient_id,
      i.slug AS ingredient_slug,
      i.name AS ingredient_name,
      ri.quantity_recipe_ingredients AS needed_quantity,
      GREATEST(ri.quantity_recipe_ingredients - COALESCE(pi.quantity_person_ingradient, 0), 0) AS missing_quantity,
      u.unit_name,
      u.coefficient
    FROM recipe_ingredients ri
    LEFT JOIN person_ingredients pi
      ON ri.ingredient_id = pi.ingredient_id AND pi.person_id = $1
    LEFT JOIN ingredients i
      ON ri.ingredient_id = i.id
    LEFT JOIN unit_measurement u
      ON i.id_unit_measurement = u.id
    WHERE ri.recipe_id = ANY($2)
    GROUP BY ri.recipe_id, i.id, i.slug, i.name, ri.quantity_recipe_ingredients, pi.quantity_person_ingradient, u.unit_name, u.coefficient`,
        [personId, recipeIds],
    );

    for (const row of missingResult.rows) {
        const group = missingByRecipe.get(row.recipe_id) ?? [];

        group.push({
            ingredient_id: row.ingredient_id,
            ingredient_slug: row.ingredient_slug,
            ingredient_name: row.ingredient_name,
            needed_quantity: row.needed_quantity,
            missing_quantity: row.missing_quantity,
            unit_name: row.unit_name,
            coefficient: row.coefficient,
        });
        missingByRecipe.set(row.recipe_id, group);
    }

    return missingByRecipe;
}
