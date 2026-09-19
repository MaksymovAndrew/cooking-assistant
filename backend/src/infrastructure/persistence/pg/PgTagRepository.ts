import type { Pool } from "pg";

import type {
    CreateTagResult,
    RenameTagOutcome,
    SetRecipeTagsOutcome,
    Tag,
    TagRepository,
} from "domain/repositories/TagRepository";

import { inPersonWriteTransaction } from "./personWriteTransaction";

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

    // one statement: both writes see the same recipe and ownership checks, so a half-applied set is impossible
    async setRecipeTags(
        personId: number,
        recipeId: number,
        tagIds: number[],
    ): Promise<SetRecipeTagsOutcome> {
        const result = await this.pool.query<{
            recipe_found: boolean;
            tags_found: boolean;
        }>(
            `WITH target AS (
                 SELECT id FROM recipes WHERE id = $2
             ),
             owned AS (
                 SELECT id FROM person_tags WHERE person_id = $1 AND id = ANY($3::int[])
             ),
             checks AS (
                 SELECT EXISTS (SELECT 1 FROM target) AS recipe_found,
                        (SELECT COUNT(*) FROM owned) = $4::int AS tags_found
             ),
             removed AS (
                 DELETE FROM recipe_tag_links link
                 USING person_tags pt, checks
                 WHERE link.tag_id = pt.id AND pt.person_id = $1 AND link.recipe_id = $2
                   AND NOT (link.tag_id = ANY($3::int[]))
                   AND checks.recipe_found AND checks.tags_found
             ),
             added AS (
                 INSERT INTO recipe_tag_links (tag_id, recipe_id)
                 SELECT owned.id, target.id FROM owned, target, checks
                 WHERE checks.recipe_found AND checks.tags_found
                 ON CONFLICT DO NOTHING
             )
             SELECT recipe_found, tags_found FROM checks`,
            [personId, recipeId, tagIds, tagIds.length],
        );
        const { recipe_found, tags_found } = result.rows[0];

        if (!recipe_found) {
            return "recipe_not_found";
        }

        return tags_found ? "saved" : "tags_not_found";
    }
}
