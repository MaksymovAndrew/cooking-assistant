import type { Pool } from "pg";

import type { SetRecipeTagsOutcome } from "domain/repositories/TagRepository";

// one statement: both writes see the same recipe and ownership checks, so a half-applied set is impossible
export async function setRecipeTags(
    pool: Pool,
    personId: number,
    recipeId: number,
    tagIds: number[],
): Promise<SetRecipeTagsOutcome> {
    const result = await pool.query<{
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
