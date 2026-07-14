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
    allergens: string | null = null,
): Promise<number> {
    const result = await pool.query<{ id: number }>(
        `INSERT INTO ingredients (name, id_unit_measurement, allergens) VALUES ($1, $2, $3) RETURNING id`,
        [unique("ingredient"), unitId, allergens],
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
