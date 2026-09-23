import type { Pool } from "pg";

import type {
    CreateTagResult,
    RenameTagOutcome,
    SetRecipeTagsOutcome,
    Tag,
    TagRepository,
} from "domain/repositories/TagRepository";

import { createTag } from "./PgTagRepository.create";
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
        return createTag(this.pool, personId, name, maxTags);
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
