import type { Pool } from "pg";

import type { CreateTagResult, Tag } from "domain/repositories/TagRepository";

import { inPersonWriteTransaction } from "./personWriteTransaction";

const MISSING_PERSON: CreateTagResult = {
    outcome: "person_not_found",
    tag: null,
};

// the count and the insert run under the owner's row lock, so two requests can't both slip past the limit
export function createTag(
    pool: Pool,
    personId: number,
    name: string,
    maxTags: number,
): Promise<CreateTagResult> {
    return inPersonWriteTransaction<CreateTagResult>(
        pool,
        personId,
        MISSING_PERSON,
        async (client) => {
            const counted = await client.query<{ total: number }>(
                `SELECT COUNT(*)::int AS total FROM person_tags WHERE person_id = $1`,
                [personId],
            );

            if (counted.rows[0].total >= maxTags) {
                return {
                    commit: false,
                    result: { outcome: "limit_reached", tag: null },
                };
            }

            const inserted = await client.query<Tag>(
                `INSERT INTO person_tags (person_id, name)
                 VALUES ($1, $2)
                 ON CONFLICT (person_id, lower(name)) DO NOTHING
                 RETURNING id, name`,
                [personId, name],
            );

            if (inserted.rowCount === 0) {
                return {
                    commit: false,
                    result: { outcome: "duplicate_name", tag: null },
                };
            }

            return {
                commit: true,
                result: { outcome: "created", tag: inserted.rows[0] },
            };
        },
    );
}
