import type { Pool } from "pg";

import type {
    RateOutcome,
    RatingRepository,
    RatingTarget,
} from "domain/repositories/RatingRepository";

import { RATING_TABLES } from "infrastructure/persistence/pg/ratingTables";

// the record's running totals are kept by a trigger on the vote tables (see the ratings migration),
// so a vote here is a plain upsert or delete
export default class PgRatingRepository implements RatingRepository {
    constructor(private pool: Pool) {}

    // one statement, so the existence and ownership checks share a snapshot with the write
    async rate(
        personId: number,
        target: RatingTarget,
        targetId: number,
        value: number,
    ): Promise<RateOutcome> {
        const { table, targetColumn, sourceTable, sourceIdColumn } =
            RATING_TABLES[target];
        const result = await this.pool.query<{ outcome: RateOutcome }>(
            `WITH target AS (
                 SELECT ${sourceIdColumn} AS id, person_id FROM ${sourceTable} WHERE ${sourceIdColumn} = $2
             ),
             upserted AS (
                 INSERT INTO ${table} (person_id, ${targetColumn}, value)
                 SELECT $1, id, $3 FROM target WHERE person_id <> $1
                 ON CONFLICT (person_id, ${targetColumn})
                 DO UPDATE SET value = EXCLUDED.value, updated_at = now()
             )
             SELECT CASE
                        WHEN NOT EXISTS (SELECT 1 FROM target) THEN 'not_found'
                        WHEN (SELECT person_id FROM target) = $1 THEN 'own_record'
                        ELSE 'rated'
                    END AS outcome`,
            [personId, targetId, value],
        );

        return result.rows[0].outcome;
    }

    // removing a vote that isn't there - or one whose record is already gone - is a no-op
    async remove(
        personId: number,
        target: RatingTarget,
        targetId: number,
    ): Promise<void> {
        const { table, targetColumn } = RATING_TABLES[target];

        await this.pool.query(
            `DELETE FROM ${table} WHERE person_id = $1 AND ${targetColumn} = $2`,
            [personId, targetId],
        );
    }
}
