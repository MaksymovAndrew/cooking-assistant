import type { Pool, PoolClient } from "pg";

import type { Menu } from "domain/entities/Menu";

import { committed, rolledBack, withTransaction } from "./transaction";

interface MenuIdRow {
    menu_id: number;
}

// unnest keeps the statement one fixed shape whatever the recipe count
async function insertMenuRecipes(
    client: PoolClient,
    menuId: number,
    recipeIds: number[],
): Promise<void> {
    if (recipeIds.length === 0) {
        return;
    }

    await client.query(
        `INSERT INTO menu_recipe (menu_id, recipe_id)
         SELECT $1, recipe_id FROM unnest($2::int[]) AS recipe_id`,
        [menuId, recipeIds],
    );
}

export function createMenuInDb(
    pool: Pool,
    { menuTitle, menuContent, language, categoryId, personId }: Menu,
    recipeIds: number[],
): Promise<number> {
    return withTransaction(pool, async (client) => {
        const menuResult = await client.query<MenuIdRow>(
            `INSERT INTO menu (menu_title, menu_content, category_id, person_id, language)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING menu_id`,
            [menuTitle, menuContent, categoryId, personId, language],
        );
        const menuId = menuResult.rows[0].menu_id;

        await insertMenuRecipes(client, menuId, recipeIds);

        return committed(menuId);
    });
}

export function updateMenuInDb(
    pool: Pool,
    id: number,
    personId: number,
    { menuTitle, menuContent, language, categoryId }: Menu,
    recipeIds: number[],
): Promise<boolean> {
    return withTransaction(pool, async (client) => {
        const result = await client.query(
            `UPDATE menu
      SET menu_title = $1, menu_content = $2, category_id = $3, language = $4
      WHERE menu_id = $5 AND person_id = $6`,
            [menuTitle, menuContent, categoryId, language, id, personId],
        );

        if (result.rowCount === 0) {
            return rolledBack(false);
        }

        await client.query("DELETE FROM menu_recipe WHERE menu_id = $1", [id]);
        await insertMenuRecipes(client, id, recipeIds);

        return committed(true);
    });
}
