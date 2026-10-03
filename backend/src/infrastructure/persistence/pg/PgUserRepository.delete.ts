import type { Pool, PoolClient } from "pg";

import { committed, withTransaction } from "./transaction";

async function deletedKeys(
    client: PoolClient,
    sql: string,
    id: number,
): Promise<string[]> {
    const result = await client.query<{ key: string | null }>(sql, [id]);

    return result.rows.flatMap((row) => (row.key ? [row.key] : []));
}

// menus and recipes would cascade; deleting them first collects their photo keys
export function deleteUser(pool: Pool, id: number): Promise<string[]> {
    return withTransaction(pool, async (client) => {
        const menuKeys = await deletedKeys(
            client,
            `DELETE FROM menu WHERE person_id = $1 RETURNING photo_key AS key`,
            id,
        );
        const recipeKeys = await deletedKeys(
            client,
            `DELETE FROM recipes WHERE person_id = $1 RETURNING photo_key AS key`,
            id,
        );
        const avatarKeys = await deletedKeys(
            client,
            `DELETE FROM person WHERE id = $1 RETURNING avatar_photo_key AS key`,
            id,
        );

        return committed([...menuKeys, ...recipeKeys, ...avatarKeys]);
    });
}
