import { randomUUID } from "node:crypto";
import type { Pool } from "pg";

// unique names per call so tests never need to truncate shared tables between each other; a UUID stays collision-free across parallel Jest workers
function unique(prefix: string): string {
    return `${prefix}-${randomUUID()}`;
}

export async function createPerson(pool: Pool): Promise<number> {
    const login = unique("person");
    const result = await pool.query<{ id: number }>(
        `INSERT INTO person (name, surname, login, password, email) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        ["Test", "User", login, "hashed-password", `${login}@example.com`],
    );

    return result.rows[0].id;
}

export async function createUnitMeasurement(
    pool: Pool,
    coefficient = 1,
): Promise<number> {
    const result = await pool.query<{ id: number }>(
        `INSERT INTO unit_measurement (unit_name, coefficient) VALUES ($1, $2) RETURNING id`,
        [unique("unit"), coefficient],
    );

    return result.rows[0].id;
}

export async function createIngredient(
    pool: Pool,
    unitId: number,
    allergens: string[] = [],
    caloriesPerUnit: number | null = null,
): Promise<number> {
    const result = await pool.query<{ id: number }>(
        `INSERT INTO ingredients (name, slug, category, id_unit_measurement, allergens, calories_per_unit)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
            unique("ingredient"),
            unique("slug"),
            "test_category",
            unitId,
            allergens,
            caloriesPerUnit,
        ],
    );

    return result.rows[0].id;
}

export async function createRecipeType(pool: Pool): Promise<number> {
    const result = await pool.query<{ id: number }>(
        `INSERT INTO recipe_types (type_name) VALUES ($1) RETURNING id`,
        [unique("type")],
    );

    return result.rows[0].id;
}

export async function createMenuCategory(pool: Pool): Promise<number> {
    const result = await pool.query<{ menu_category_id: number }>(
        `INSERT INTO menu_category (category_name) VALUES ($1) RETURNING menu_category_id`,
        [unique("category")],
    );

    return result.rows[0].menu_category_id;
}

export { unique };

export interface RecipeIngredientFixture {
    ingredientId: number;
    quantity: number;
}

export async function createRecipe(
    pool: Pool,
    personId: number,
    ingredients: RecipeIngredientFixture[],
): Promise<number> {
    const result = await pool.query<{ id: number }>(
        `INSERT INTO recipes (title, content, person_id) VALUES ($1, $2, $3) RETURNING id`,
        [unique("recipe"), "Cook it.", personId],
    );
    const recipeId = result.rows[0].id;

    for (const { ingredientId, quantity } of ingredients) {
        await pool.query(
            `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_recipe_ingredients)
             VALUES ($1, $2, $3)`,
            [recipeId, ingredientId, quantity],
        );
    }

    return recipeId;
}

// each recipe once: the database refuses the same recipe twice in one menu
export async function createMenu(
    pool: Pool,
    personId: number,
    categoryId: number,
    recipeIds: number[],
): Promise<number> {
    const result = await pool.query<{ menu_id: number }>(
        `INSERT INTO menu (menu_title, person_id, category_id) VALUES ($1, $2, $3) RETURNING menu_id`,
        [unique("menu"), personId, categoryId],
    );
    const menuId = result.rows[0].menu_id;

    for (const recipeId of recipeIds) {
        await pool.query(
            `INSERT INTO menu_recipe (menu_id, recipe_id) VALUES ($1, $2)`,
            [menuId, recipeId],
        );
    }

    return menuId;
}
