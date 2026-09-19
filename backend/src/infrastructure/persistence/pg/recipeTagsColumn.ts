// the requester's own tags on the recipe; null for a guest, the same contract as isFavourite
export function recipeTagsColumn(
    recipeIdExpression: string,
    userPlaceholder: string,
): string {
    return `CASE WHEN ${userPlaceholder}::int IS NULL THEN NULL
                ELSE COALESCE((
                    SELECT json_agg(json_build_object('id', pt.id, 'name', pt.name) ORDER BY lower(pt.name))
                    FROM recipe_tag_links link
                    JOIN person_tags pt ON pt.id = link.tag_id
                    WHERE link.recipe_id = ${recipeIdExpression} AND pt.person_id = ${userPlaceholder}::int
                ), '[]'::json)
            END AS "tags"`;
}
