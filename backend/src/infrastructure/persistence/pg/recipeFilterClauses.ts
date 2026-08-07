import type { RecipeFilters } from "domain/repositories/recipe.filters";

import {
    escapeLikePattern,
    type SqlFilterBuilder,
} from "infrastructure/persistence/pg/sqlFilterBuilder";

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
    {
        applies: (filters) => typeof filters.min_cooking_time !== "undefined",
        apply: (builder, filters) => {
            const { min_cooking_time } = filters;

            if (typeof min_cooking_time === "undefined") {
                return;
            }

            builder.add(
                (bind) => `r.cooking_time >= ${bind(min_cooking_time)}`,
            );
        },
    },
    {
        applies: (filters) => typeof filters.max_cooking_time !== "undefined",
        apply: (builder, filters) => {
            const { max_cooking_time } = filters;

            if (typeof max_cooking_time === "undefined") {
                return;
            }

            builder.add(
                (bind) => `r.cooking_time <= ${bind(max_cooking_time)}`,
            );
        },
    },
    {
        applies: (filters) => typeof filters.min_calories !== "undefined",
        apply: (builder, filters) => {
            const { min_calories } = filters;

            if (typeof min_calories === "undefined") {
                return;
            }

            // ROUND avoids float noise on the accumulated DOUBLE PRECISION sum, same reasoning as
            // the in_pantry clause below - otherwise a "true" 200 landing at 199.999999999998
            // would silently drop out of a min_calories=200 search
            builder.add(
                (bind) =>
                    `ROUND(COALESCE(r.calories_override, r.calories_computed)::numeric, 2) >= ${bind(min_calories)}`,
            );
        },
    },
    {
        applies: (filters) => typeof filters.max_calories !== "undefined",
        apply: (builder, filters) => {
            const { max_calories } = filters;

            if (typeof max_calories === "undefined") {
                return;
            }

            builder.add(
                (bind) =>
                    `ROUND(COALESCE(r.calories_override, r.calories_computed)::numeric, 2) <= ${bind(max_calories)}`,
            );
        },
    },
    {
        applies: (filters) => filters.in_pantry === true,
        apply: (builder, _filters, context) => {
            // SearchRecipes already rejects in_pantry for a null (guest) requester before the query
            // is built - this re-check only narrows userId to number for the bind() call below
            const { userId } = context;

            if (userId === null) {
                return;
            }

            // a recipe qualifies only if the pantry covers every ingredient in sufficient quantity (ROUND avoids float noise, see PgPantryRepository.queries.ts); the second EXISTS rules out ingredient-less recipes, which would pass the NOT EXISTS trivially otherwise
            builder.add(
                (bind) => `NOT EXISTS (
        SELECT 1 FROM recipe_ingredients ri2
        LEFT JOIN person_ingredients pi
          ON pi.ingredient_id = ri2.ingredient_id AND pi.person_id = ${bind(userId)}
        WHERE ri2.recipe_id = r.id AND (pi.ingredient_id IS NULL
          OR ROUND(pi.quantity_person_ingradient::numeric, 3)
             < ROUND(ri2.quantity_recipe_ingredients::numeric, 3))
      )
      AND EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = r.id)`,
            );
        },
    },
];
