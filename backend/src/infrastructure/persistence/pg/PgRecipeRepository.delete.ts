import type { Pool } from "pg";

import type { DeletedRecord } from "domain/repositories/PhotoRepository";

// one statement: its ingredients, menu links, favourites, ratings and tags cascade, and the photo key comes back
// from the delete itself - read in a separate query, an upload landing in between would orphan its files
export async function deleteRecipeById(
    pool: Pool,
    recipeId: number,
    personId: number,
): Promise<DeletedRecord | null> {
    const result = await pool.query<{ photo_key: string | null }>(
        `DELETE FROM recipes WHERE id = $1 AND person_id = $2 RETURNING photo_key`,
        [recipeId, personId],
    );

    return result.rows.length === 0
        ? null
        : { photoKey: result.rows[0].photo_key };
}
