import type { Pool } from "pg";

interface MenuRow {
    id: number;
    title: string;
    menuContent: string;
    categoryName: string;
    category_id: number;
    personId: number;
    isOwner: boolean;
}

interface MenuRecipeRow {
    recipe_id: number;
    title: string;
    content: string;
    person_id: number;
    type_id: number | null;
    creation_date: Date;
    cooking_time: number | null;
    calories_per_portion: number | null;
    type_name: string | null;
    ingredients: string[];
}

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

interface MissingIngredient {
    ingredient_id: number;
    ingredient_slug: string;
    ingredient_name: string;
    needed_quantity: number;
    missing_quantity: number;
    unit_name: string;
    coefficient: number;
}

export async function findMenuByIdWithRecipes(
    pool: Pool,
    id: string | number,
    personId: number,
): Promise<unknown> {
    const menuResult = await pool.query<MenuRow>(
        `SELECT
        m.menu_id AS id,
        m.menu_title AS title,
        m.menu_content AS menuContent,
        mc.category_name AS categoryName,
        m.category_id,
        m.person_id AS personId,
        (m.person_id = $2) AS "isOwner"
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
        r.person_id,
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

    // fetch missing ingredients for every recipe of the menu in one query, then group in memory
    const missingByRecipe = new Map<number, MissingIngredient[]>();

    if (recipeIds.length > 0) {
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
    }

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
