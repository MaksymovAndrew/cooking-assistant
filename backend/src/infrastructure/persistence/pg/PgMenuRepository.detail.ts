import type { Pool } from "pg";

import type { MenuDetail, MenuDetailRow } from "domain/repositories/menu.types";

import { authorColumn } from "./authorColumn";
import { isFavouriteColumn } from "./isFavouriteColumn";
import { isOwnerColumn } from "./isOwnerColumn";
import { loadMissingIngredients } from "./PgMenuRepository.missingIngredients";
import { loadMenuRecipes } from "./PgMenuRepository.recipes";
import { ratingColumns } from "./ratingColumns";

export async function findMenuByIdWithRecipes(
    pool: Pool,
    id: number,
    personId: number | null,
): Promise<MenuDetail | null> {
    const menuResult = await pool.query<MenuDetailRow>(
        `SELECT
        m.menu_id AS id,
        m.menu_title AS title,
        m.menu_content AS "menuContent",
        m.language,
        mc.category_name AS "categoryName",
        m.category_id,
        m.photo_key,
        m.creation_date,
        ${authorColumn("m")},
        ${isOwnerColumn("m", "$2")},
        ${isFavouriteColumn("menu", "m.menu_id", "$2")},
        ${ratingColumns("menu", "m", "$2")}
      FROM menu m
      LEFT JOIN menu_category mc ON m.category_id = mc.menu_category_id
      WHERE m.menu_id = $1`,
        [id, personId],
    );

    if (menuResult.rows.length === 0) {
        return null;
    }

    const menu = menuResult.rows[0];

    const recipes = await loadMenuRecipes(pool, id);
    const recipeIds = recipes.map((recipe) => recipe.recipe_id);

    const missingByRecipe = await loadMissingIngredients(
        pool,
        recipeIds,
        personId,
    );

    const recipesWithDetails = recipes.map((recipe) => ({
        ...recipe,
        missingIngredients: missingByRecipe.get(recipe.recipe_id) ?? [],
    }));

    const allergensResult = await pool.query<{ allergen: string }>(
        `SELECT DISTINCT unnest(i.allergens) AS allergen
      FROM menu_recipe mr
      JOIN recipe_ingredients ri ON ri.recipe_id = mr.recipe_id
      JOIN ingredients i ON i.id = ri.ingredient_id
      WHERE mr.menu_id = $1
      ORDER BY allergen`,
        [id],
    );

    return {
        menu,
        recipes: recipesWithDetails,
        allergens: allergensResult.rows.map((row) => row.allergen),
    };
}
