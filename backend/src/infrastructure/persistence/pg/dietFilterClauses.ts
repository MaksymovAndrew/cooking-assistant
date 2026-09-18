import type { RecipeFilters } from "domain/repositories/recipe.filters";

import { containsAvoidedCondition } from "infrastructure/persistence/pg/containsAvoidedColumn";
import type { SqlFilterBuilder } from "infrastructure/persistence/pg/sqlFilterBuilder";

const excludeAllergensFilterClause = {
    applies: (filters: RecipeFilters) =>
        typeof filters.exclude_allergens !== "undefined",
    apply: (builder: SqlFilterBuilder, filters: RecipeFilters) => {
        const { exclude_allergens } = filters;

        if (typeof exclude_allergens === "undefined") {
            return;
        }

        builder.add(
            (bind) => `NOT EXISTS (
        SELECT 1 FROM recipe_ingredients ri2
        JOIN ingredients i2 ON i2.id = ri2.ingredient_id
        WHERE ri2.recipe_id = r.id AND i2.allergens && ${bind(exclude_allergens)}::text[]
      )`,
        );
    },
};

const hideAvoidedFilterClause = {
    applies: (filters: RecipeFilters) => filters.hide_avoided === true,
    apply: (
        builder: SqlFilterBuilder,
        _filters: RecipeFilters,
        context: { userId: number | null },
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
