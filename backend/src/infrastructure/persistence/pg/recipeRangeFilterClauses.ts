import type { RecipeFilters } from "domain/repositories/recipe.filters";

import type { SqlFilterBuilder } from "infrastructure/persistence/pg/sqlFilterBuilder";

// cooking time and calories, the two numeric ranges both list filters expose
export const RECIPE_RANGE_FILTER_CLAUSES = [
    {
        applies: (filters: RecipeFilters) =>
            typeof filters.min_cooking_time !== "undefined",
        apply: (builder: SqlFilterBuilder, filters: RecipeFilters) => {
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
        applies: (filters: RecipeFilters) =>
            typeof filters.max_cooking_time !== "undefined",
        apply: (builder: SqlFilterBuilder, filters: RecipeFilters) => {
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
        applies: (filters: RecipeFilters) =>
            typeof filters.min_calories !== "undefined",
        apply: (builder: SqlFilterBuilder, filters: RecipeFilters) => {
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
        applies: (filters: RecipeFilters) =>
            typeof filters.max_calories !== "undefined",
        apply: (builder: SqlFilterBuilder, filters: RecipeFilters) => {
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
];
