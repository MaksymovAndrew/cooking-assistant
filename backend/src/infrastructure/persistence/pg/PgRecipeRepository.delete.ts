import type { Pool } from "pg";

import type { DeletedRecord } from "domain/repositories/PhotoRepository";

// RETURNING the photo key: a separate read would let a racing upload orphan its files
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
