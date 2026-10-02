import type { RecipeFilters } from "domain/repositories/recipe.filters";

import { caloriesPerPortion } from "./calorieColumns";
import { type FilterClause, whenDefined } from "./filterClause";

// ROUND avoids float noise on the accumulated DOUBLE PRECISION sum: a "true" 200 landing at
// 199.999999999998 would otherwise drop out of a min_calories=200 search
const CALORIES = `ROUND(${caloriesPerPortion("r")}::numeric, 2)`;

// cooking time and calories, the two numeric ranges both list filters expose
export const RECIPE_RANGE_FILTER_CLAUSES: readonly FilterClause<RecipeFilters>[] =
    [
        whenDefined("min_cooking_time", (builder, minutes) => {
            builder.add((bind) => `r.cooking_time >= ${bind(minutes)}`);
        }),
        whenDefined("max_cooking_time", (builder, minutes) => {
            builder.add((bind) => `r.cooking_time <= ${bind(minutes)}`);
        }),
        whenDefined("min_calories", (builder, calories) => {
            builder.add((bind) => `${CALORIES} >= ${bind(calories)}`);
        }),
        whenDefined("max_calories", (builder, calories) => {
            builder.add((bind) => `${CALORIES} <= ${bind(calories)}`);
        }),
    ];
