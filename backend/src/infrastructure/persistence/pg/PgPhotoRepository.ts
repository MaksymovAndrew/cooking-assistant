import type { Pool } from "pg";

import type {
    PhotoRepository,
    PhotoSwap,
    PhotoTarget,
    PhotoUsage,
} from "domain/repositories/PhotoRepository";

import { PHOTO_TABLES } from "./photoTables";

export default class PgPhotoRepository implements PhotoRepository {
    constructor(private pool: Pool) {}

    async usage(
        personId: number,
        target: PhotoTarget,
        targetId: number,
    ): Promise<PhotoUsage> {
        const { table, idColumn, ownerColumn, keyColumn } =
            PHOTO_TABLES[target];
        const result = await this.pool.query<{
            count: number;
            target_has_photo: boolean;
        }>(
            `SELECT
                 ((SELECT count(*) FROM recipes WHERE person_id = $1 AND photo_key IS NOT NULL)
                 + (SELECT count(*) FROM menu WHERE person_id = $1 AND photo_key IS NOT NULL)
                 + (SELECT count(*) FROM person WHERE id = $1 AND avatar_photo_key IS NOT NULL)
                 )::int AS count,
                 EXISTS (
                     SELECT 1 FROM ${table}
                     WHERE ${idColumn} = $2 AND ${ownerColumn} = $1 AND ${keyColumn} IS NOT NULL
                 ) AS target_has_photo`,
            [personId, targetId],
        );
        const [row] = result.rows;

        return { count: row.count, targetHasPhoto: row.target_has_photo };
    }

    // the locked subquery lets racing uploads each learn exactly which file they displaced
    async replace(
        personId: number,
        target: PhotoTarget,
        targetId: number,
        key: string | null,
    ): Promise<PhotoSwap | null> {
        const { table, idColumn, ownerColumn, keyColumn } =
            PHOTO_TABLES[target];
        const result = await this.pool.query<{ previous_key: string | null }>(
            `UPDATE ${table} AS t
             SET ${keyColumn} = $3
             FROM (
                 SELECT ${keyColumn} AS previous_key FROM ${table}
                 WHERE ${idColumn} = $2 AND ${ownerColumn} = $1
                 FOR UPDATE
             ) AS old
             WHERE t.${idColumn} = $2 AND t.${ownerColumn} = $1
             RETURNING old.previous_key`,
            [personId, targetId, key],
        );

        if (result.rows.length === 0) {
            return null;
        }

        return { previousKey: result.rows[0].previous_key };
    }
}
