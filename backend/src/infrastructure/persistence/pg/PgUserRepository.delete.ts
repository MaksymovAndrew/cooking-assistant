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

// everything the person owns cascades from the person row; menus and recipes are deleted first only
// to collect their photo keys, so the files can go once the transaction commits
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
