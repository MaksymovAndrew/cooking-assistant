import type { Pool } from "pg";

import type { Locale } from "constants/locales";
import type {
    RecordAuthor,
    RecordRating,
} from "domain/repositories/recordAuthor";

import { authorColumn } from "infrastructure/persistence/pg/authorColumn";
import { isFavouriteColumn } from "infrastructure/persistence/pg/isFavouriteColumn";
import { isOwnerColumn } from "infrastructure/persistence/pg/isOwnerColumn";
import { ratingColumns } from "infrastructure/persistence/pg/ratingColumns";

import { loadMissingIngredients } from "./PgMenuRepository.missingIngredients";
import { loadMenuRecipes } from "./PgMenuRepository.recipes";

interface MenuRow extends RecordRating {
    id: number;
    title: string;
    menuContent: string;
    language: Locale;
    categoryName: string;
    category_id: number;
    isOwner: boolean;
    isFavourite: boolean | null;
    photo_key: string | null;
    author: RecordAuthor;
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
        m.language,
        mc.category_name AS categoryName,
        m.category_id,
        m.photo_key,
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

    // despite the name, this carries every ingredient requirement, not only shortfalls -
    // fully-stocked ones come back with missing_quantity: 0 so the client can render both states
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
