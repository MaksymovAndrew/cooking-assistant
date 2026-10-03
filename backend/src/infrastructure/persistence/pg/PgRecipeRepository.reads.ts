import type { Pool } from "pg";

import type { RecipeDetailRow } from "domain/repositories/recipe.types";

import { authorColumn } from "./authorColumn";
import { caloriesPerPortion } from "./calorieColumns";
import { containsAvoidedColumn } from "./containsAvoidedColumn";
import { isFavouriteColumn } from "./isFavouriteColumn";
import { isOwnerColumn } from "./isOwnerColumn";
import { ratingColumns } from "./ratingColumns";
import { recipeTagsColumn } from "./recipeTagsColumn";

// explicit columns: r.* would leak the owner's person_id to every caller
export async function findRecipeByIdWithIngredients(
    pool: Pool,
    recipeId: number,
    currentUserId: number | null,
): Promise<RecipeDetailRow | null> {
    const result = await pool.query<RecipeDetailRow>(
        `SELECT r.id, r.title, r.content, r.language, r.type_id, r.creation_date, r.cooking_time,
                  r.calories_override, r.calories_computed, r.photo_key,
                  ${authorColumn("r")},
                  ${isOwnerColumn("r", "$2")},
                  ${isFavouriteColumn("recipe", "r.id", "$2")},
                  ${containsAvoidedColumn("r.id", "$2")},
                  ${recipeTagsColumn("r.id", "$2")},
                  ${ratingColumns("recipe", "r", "$2")},
                  ${caloriesPerPortion("r")} AS calories_per_portion,
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
