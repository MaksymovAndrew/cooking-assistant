import type { RecipeFilters } from "domain/repositories/recipe.filters";

import type { SqlFilterBuilder } from "infrastructure/persistence/pg/sqlFilterBuilder";

export const tagsFilterClause = {
    applies: (filters: RecipeFilters) => typeof filters.tag_ids !== "undefined",
    apply: (
        builder: SqlFilterBuilder,
        filters: RecipeFilters,
        context: { userId: number | null },
    ) => {
        const { tag_ids } = filters;
        const { userId } = context;

        // guests are rejected before the query is built - this only narrows the values for bind()
        if (typeof tag_ids === "undefined" || userId === null) {
            return;
        }

        const ids = tag_ids.split(",").map(Number);

        builder.add(
            (bind) => `EXISTS (
        SELECT 1 FROM recipe_tag_links link
        JOIN person_tags pt ON pt.id = link.tag_id
        WHERE link.recipe_id = r.id AND pt.person_id = ${bind(userId)}
          AND link.tag_id = ANY(${bind(ids)}::int[])
      )`,
        );
    },
};
