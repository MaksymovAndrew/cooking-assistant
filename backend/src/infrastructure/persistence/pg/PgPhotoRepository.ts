import type { Pool } from "pg";

import type {
    PhotoRepository,
    PhotoSwap,
    PhotoTarget,
} from "domain/repositories/PhotoRepository";

import { PHOTO_TABLES } from "infrastructure/persistence/pg/photoTables";

export default class PgPhotoRepository implements PhotoRepository {
    constructor(private pool: Pool) {}

    // the locked subquery hands back the key being replaced, so two uploads racing for one record
    // each learn exactly which file they displaced
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

    async findKey(
        personId: number,
        target: PhotoTarget,
        targetId: number,
    ): Promise<string | null> {
        const { table, idColumn, ownerColumn, keyColumn } =
            PHOTO_TABLES[target];
        const result = await this.pool.query<{ key: string | null }>(
            `SELECT ${keyColumn} AS key FROM ${table}
             WHERE ${idColumn} = $2 AND ${ownerColumn} = $1`,
            [personId, targetId],
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0].key;
    }

    async listOwnedKeys(personId: number): Promise<string[]> {
        const selects = Object.values(PHOTO_TABLES).map(
            ({ table, ownerColumn, keyColumn }) =>
                `SELECT ${keyColumn} AS key FROM ${table}
                 WHERE ${ownerColumn} = $1 AND ${keyColumn} IS NOT NULL`,
        );
        const result = await this.pool.query<{ key: string }>(
            selects.join(" UNION ALL "),
            [personId],
        );

        return result.rows.map((row) => row.key);
    }
}
