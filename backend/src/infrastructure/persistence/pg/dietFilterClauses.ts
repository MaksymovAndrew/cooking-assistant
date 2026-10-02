import type { RecipeFilters } from "domain/repositories/recipe.filters";

import { containsAvoidedCondition } from "./containsAvoidedColumn";
import { type ClauseContext, whenDefined } from "./filterClause";
import type { SqlFilterBuilder } from "./sqlFilterBuilder";

const excludeAllergensFilterClause = whenDefined<
    RecipeFilters,
    "exclude_allergens"
>("exclude_allergens", (builder, allergens) => {
    builder.add(
        (bind) => `NOT EXISTS (
        SELECT 1 FROM recipe_ingredients ri2
        JOIN ingredients i2 ON i2.id = ri2.ingredient_id
        WHERE ri2.recipe_id = r.id AND i2.allergens && ${bind(allergens)}::text[]
      )`,
    );
});

const hideAvoidedFilterClause = {
    applies: (filters: RecipeFilters) => filters.hide_avoided === true,
    apply: (
        builder: SqlFilterBuilder,
        _filters: RecipeFilters,
        context: ClauseContext,
    ) => {
        // guests are rejected before the query is built - this only narrows userId for bind()
        const { userId } = context;

        if (userId === null) {
            return;
        }

        builder.add(
            (bind) => `NOT ${containsAvoidedCondition("r.id", bind(userId))}`,
        );
    },
};

export const DIET_FILTER_CLAUSES = [
    excludeAllergensFilterClause,
    hideAvoidedFilterClause,
];
