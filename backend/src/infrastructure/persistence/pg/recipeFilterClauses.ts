import type { RecipeFilters } from "domain/repositories/recipe.filters";

import { DIET_FILTER_CLAUSES } from "infrastructure/persistence/pg/dietFilterClauses";
import { favouritesFilterClause } from "infrastructure/persistence/pg/favouritesFilterClause";
import { pantryFilterClause } from "infrastructure/persistence/pg/pantryFilterClause";
import { topRatedFilterClause } from "infrastructure/persistence/pg/ratingColumns";
import { RECIPE_RANGE_FILTER_CLAUSES } from "infrastructure/persistence/pg/recipeRangeFilterClauses";
import {
    escapeLikePattern,
    type SqlFilterBuilder,
} from "infrastructure/persistence/pg/sqlFilterBuilder";
import { tagsFilterClause } from "infrastructure/persistence/pg/tagsFilterClause";

interface RecipeClauseContext {
    userId: number | null;
}

// apply() re-checks the same condition applies() already gated on - applies() is a plain boolean
// predicate, so TypeScript can't narrow filters inside apply() from it; this isn't redundant, it's
// how each clause gets its field back as a non-undefined value without an unsafe cast
interface RecipeFilterClause {
    applies: (filters: RecipeFilters) => boolean;
    apply: (
        builder: SqlFilterBuilder,
        filters: RecipeFilters,
        context: RecipeClauseContext,
    ) => void;
}

export const RECIPE_FILTER_CLAUSES: readonly RecipeFilterClause[] = [
    {
        applies: (filters) => typeof filters.recipe_name !== "undefined",
        apply: (builder, filters) => {
            const { recipe_name } = filters;

            if (typeof recipe_name === "undefined") {
                return;
            }

            const likePattern = `%${escapeLikePattern(recipe_name)}%`;

            builder.add((bind) => `r.title ILIKE ${bind(likePattern)}`);
        },
    },
    {
        applies: (filters) => typeof filters.ingredient_ids !== "undefined",
        apply: (builder, filters) => {
            const { ingredient_ids } = filters;

            if (typeof ingredient_ids === "undefined") {
                return;
            }

            const ids = ingredient_ids.split(",").map(Number);

            // a separate EXISTS (not a WHERE on the outer join) so a match doesn't strip the recipe's other ingredients out of the json_agg below - OR semantics: any id matches
            builder.add(
                (bind) => `EXISTS (
        SELECT 1 FROM recipe_ingredients ri2
        WHERE ri2.recipe_id = r.id AND ri2.ingredient_id = ANY(${bind(ids)}::int[])
      )`,
            );
        },
    },
    {
        applies: (filters) => typeof filters.type_ids !== "undefined",
        apply: (builder, filters) => {
            const { type_ids } = filters;

            if (typeof type_ids === "undefined") {
                return;
            }

            const ids = type_ids.split(",").map(Number);

            builder.add((bind) => `r.type_id = ANY(${bind(ids)}::int[])`);
        },
    },
    {
        applies: (filters) =>
            typeof filters.start_date !== "undefined" ||
            typeof filters.end_date !== "undefined",
        apply: (builder, filters) => {
            const { start_date, end_date } = filters;

            if (start_date && end_date) {
                builder.add(
                    (bind) =>
                        `r.creation_date BETWEEN ${bind(start_date)} AND ${bind(end_date)}`,
                );
            } else if (start_date) {
                builder.add((bind) => `r.creation_date >= ${bind(start_date)}`);
            } else if (end_date) {
                builder.add((bind) => `r.creation_date <= ${bind(end_date)}`);
            }
        },
    },
    ...RECIPE_RANGE_FILTER_CLAUSES,
    pantryFilterClause,
    favouritesFilterClause("recipe", "r.id"),
    topRatedFilterClause("r"),
    ...DIET_FILTER_CLAUSES,
    tagsFilterClause,
];
