import type { Pool } from "pg";

import { isFavouriteColumn } from "infrastructure/persistence/pg/isFavouriteColumn";
import { isOwnerColumn } from "infrastructure/persistence/pg/isOwnerColumn";

import { loadMissingIngredients } from "./PgMenuRepository.missingIngredients";

interface MenuRow {
    id: number;
    title: string;
    menuContent: string;
    categoryName: string;
    category_id: number;
    isOwner: boolean;
    isFavourite: boolean | null;
}

interface MenuRecipeRow {
    recipe_id: number;
    title: string;
    content: string;
    type_id: number | null;
    creation_date: Date;
    cooking_time: number | null;
    calories_per_portion: number | null;
    type_name: string | null;
    ingredients: string[];
}

export async function findMenuByIdWithRecipes(
    pool: Pool,
    id: string | number,
    personId: number | null,
): Promise<unknown> {
    const menuResult = await pool.query<MenuRow>(
        `SELECT
        m.menu_id AS id,
        m.menu_title AS title,
        m.menu_content AS menuContent,
        mc.category_name AS categoryName,
        m.category_id,
        ${isOwnerColumn("m", "$2")},
        ${isFavouriteColumn("menu", "m.menu_id", "$2")}
      FROM menu m
      LEFT JOIN menu_category mc ON m.category_id = mc.menu_category_id
      WHERE m.menu_id = $1`,
        [id, personId],
    );

    if (menuResult.rows.length === 0) {
        return null;
    }

    const menu = menuResult.rows[0];

    const recipeResult = await pool.query<MenuRecipeRow>(
        `SELECT
        r.id AS recipe_id,
        r.title,
        r.content,
        r.type_id,
        r.creation_date,
        r.cooking_time,
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
        [id],
    );

    const recipeIds = recipeResult.rows.map((recipe) => recipe.recipe_id);

    const missingByRecipe = await loadMissingIngredients(
        pool,
        recipeIds,
        personId,
    );

    // despite the name, this carries every ingredient requirement, not only shortfalls -
    // fully-stocked ones come back with missing_quantity: 0 so the client can render both states
    const recipesWithDetails = recipeResult.rows.map((recipe) => ({
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
