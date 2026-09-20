import type { Pool } from "pg";

import type { Menu } from "domain/entities/Menu";

interface MenuIdRow {
    menu_id: number;
}

function buildMenuRecipeInsert(
    menuId: number | string,
    recipeIds: number[],
): { placeholders: string; params: (number | string)[] } {
    const placeholders = recipeIds
        .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
        .join(", ");
    const params = recipeIds.flatMap((recipeId) => [menuId, recipeId]);

    return { placeholders, params };
}

export async function createMenuInDb(
    pool: Pool,
    { menuTitle, menuContent, categoryId, personId }: Menu,
    recipeIds: number[],
): Promise<unknown> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const menuResult = await client.query<MenuIdRow>(
            `INSERT INTO menu (menu_title, menu_content, category_id, person_id)
             VALUES ($1, $2, $3, $4)
             RETURNING menu_id`,
            [menuTitle, menuContent, categoryId, personId],
        );
        const menuId = menuResult.rows[0].menu_id;

        if (recipeIds.length > 0) {
            const { placeholders, params } = buildMenuRecipeInsert(
                menuId,
                recipeIds,
            );

            await client.query(
                `INSERT INTO menu_recipe (menu_id, recipe_id) VALUES ${placeholders}`,
                params,
            );
        }

        await client.query("COMMIT");

        return menuId;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function updateMenuInDb(
    pool: Pool,
    id: string | number,
    personId: number,
    { menuTitle, menuContent, categoryId }: Menu,
    recipeIds: number[],
): Promise<boolean> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `UPDATE menu
      SET menu_title = $1, menu_content = $2, category_id = $3
      WHERE menu_id = $4 AND person_id = $5`,
            [menuTitle, menuContent, categoryId, id, personId],
        );

        if (result.rowCount === 0) {
            await client.query("ROLLBACK");

            return false;
        }

        await client.query("DELETE FROM menu_recipe WHERE menu_id = $1", [id]);

        if (recipeIds.length > 0) {
            const { placeholders, params } = buildMenuRecipeInsert(
                id,
                recipeIds,
            );

            await client.query(
                `INSERT INTO menu_recipe (menu_id, recipe_id) VALUES ${placeholders}`,
                params,
            );
        }

        await client.query("COMMIT");

        return true;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
