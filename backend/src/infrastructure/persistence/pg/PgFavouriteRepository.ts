import type { Pool } from "pg";

import type {
    FavouriteRepository,
    FavouriteTarget,
} from "domain/repositories/FavouriteRepository";

import { FAVOURITE_TABLES } from "infrastructure/persistence/pg/favouriteTables";

export default class PgFavouriteRepository implements FavouriteRepository {
    constructor(private pool: Pool) {}

    // one statement, so the existence check and the insert share a snapshot; a repeat add is a no-op
    async add(
        personId: number,
        target: FavouriteTarget,
        targetId: number,
    ): Promise<boolean> {
        const { table, targetColumn, sourceTable, sourceIdColumn } =
            FAVOURITE_TABLES[target];
        const result = await this.pool.query<{ found: boolean }>(
            `WITH target AS (
                 SELECT ${sourceIdColumn} AS id FROM ${sourceTable} WHERE ${sourceIdColumn} = $2
             ),
             inserted AS (
                 INSERT INTO ${table} (person_id, ${targetColumn})
                 SELECT $1, id FROM target
                 ON CONFLICT DO NOTHING
             )
             SELECT EXISTS (SELECT 1 FROM target) AS found`,
            [personId, targetId],
        );

        return result.rows[0].found;
    }

    async remove(
        personId: number,
        target: FavouriteTarget,
        targetId: number,
    ): Promise<void> {
        const { table, targetColumn } = FAVOURITE_TABLES[target];

        await this.pool.query(
            `DELETE FROM ${table} WHERE person_id = $1 AND ${targetColumn} = $2`,
            [personId, targetId],
        );
    }
}
