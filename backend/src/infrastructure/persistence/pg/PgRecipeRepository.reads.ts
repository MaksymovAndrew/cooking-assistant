import type { Pool } from "pg";

interface RecipeListRow {
    id: number;
    title: string;
    content: string;
    person_id: number;
    type_id: number | null;
    creation_date: Date;
    cooking_time: number | null;
    calories_override: number | null;
    calories_computed: number | null;
    type_name: string | null;
    ingredients: string[];
}

interface RecipeDetailRow extends RecipeListRow {
    isOwner: boolean;
    calories_per_portion: number | null;
}

export async function findAllRecipes(pool: Pool): Promise<unknown[]> {
    const result = await pool.query<RecipeListRow>(
        `SELECT r.*, rt.type_name, array_agg(i.name) AS ingredients
         FROM recipes r
                LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
                LEFT JOIN ingredients i ON ri.ingredient_id = i.id
                LEFT JOIN recipe_types rt ON r.type_id = rt.id
         GROUP BY r.id, rt.type_name`,
    );

    return result.rows;
}

export async function findRecipeByIdWithIngredients(
    pool: Pool,
    recipeId: string | number,
    currentUserId: number | null,
): Promise<unknown> {
    const result = await pool.query<RecipeDetailRow>(
        `SELECT r.*,
                  COALESCE(r.person_id = $2, false) AS "isOwner",
                  COALESCE(r.calories_override, r.calories_computed) AS calories_per_portion,
                  json_agg(
                      json_build_object(
                          'id', i.id,
                          'slug', i.slug,
                          'name', i.name,
                          'category', i.category,
                          'quantity_recipe_ingredients', ri.quantity_recipe_ingredients,
                          'unit_name', um.unit_name,
                          'allergens', i.allergens,
                          'calories_per_unit', i.calories_per_unit
                      )
                  ) AS ingredients,
                  rt.type_name
           FROM recipes r
                  LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
                  LEFT JOIN ingredients i ON ri.ingredient_id = i.id
                  LEFT JOIN unit_measurement um ON i.id_unit_measurement = um.id
                  LEFT JOIN recipe_types rt ON r.type_id = rt.id
           WHERE r.id = $1
           GROUP BY r.id, rt.type_name`,
        [recipeId, currentUserId],
    );

    return result.rows[0] ?? null;
}
