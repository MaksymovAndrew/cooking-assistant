import type { Pool } from "pg";

import type {
    CreateTagResult,
    RenameTagOutcome,
    SetRecipeTagsOutcome,
    Tag,
    TagRepository,
} from "domain/repositories/TagRepository";

import { inPersonWriteTransaction } from "./personWriteTransaction";
import { setRecipeTags } from "./PgTagRepository.recipeLinks";

export default class PgTagRepository implements TagRepository {
    constructor(private pool: Pool) {}

    async findByPerson(personId: number): Promise<Tag[]> {
        const result = await this.pool.query<Tag>(
            `SELECT id, name FROM person_tags WHERE person_id = $1 ORDER BY lower(name), id`,
            [personId],
        );

        return result.rows;
    }

    create(
        personId: number,
        name: string,
        maxTags: number,
    ): Promise<CreateTagResult> {
        const missingPerson: CreateTagResult = {
            outcome: "person_not_found",
            tag: null,
        };

        return inPersonWriteTransaction<CreateTagResult>(
            this.pool,
            personId,
            missingPerson,
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

    // one statement, so the name check and the update share a snapshot
    async rename(
        personId: number,
        tagId: number,
        name: string,
    ): Promise<RenameTagOutcome> {
        const result = await this.pool.query<{
            conflicted: boolean;
            renamed: boolean;
        }>(
            `WITH conflict AS (
                 SELECT 1 FROM person_tags
                 WHERE person_id = $1 AND lower(name) = lower($3) AND id <> $2
             ),
             updated AS (
                 UPDATE person_tags SET name = $3
                 WHERE id = $2 AND person_id = $1 AND NOT EXISTS (SELECT 1 FROM conflict)
                 RETURNING id
             )
             SELECT EXISTS (SELECT 1 FROM conflict) AS conflicted,
                    EXISTS (SELECT 1 FROM updated) AS renamed`,
            [personId, tagId, name],
        );
        const { conflicted, renamed } = result.rows[0];

        if (renamed) {
            return "renamed";
        }

        return conflicted ? "duplicate_name" : "not_found";
    }

    async delete(personId: number, tagId: number): Promise<boolean> {
        const result = await this.pool.query(
            `DELETE FROM person_tags WHERE id = $1 AND person_id = $2`,
            [tagId, personId],
        );

        return (result.rowCount ?? 0) > 0;
    }

    setRecipeTags(
        personId: number,
        recipeId: number,
        tagIds: number[],
    ): Promise<SetRecipeTagsOutcome> {
        return setRecipeTags(this.pool, personId, recipeId, tagIds);
    }
}
