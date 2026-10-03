import type { RecipeFilters } from "domain/repositories/recipe.filters";

import { caloriesPerPortion } from "./calorieColumns";
import { type FilterClause, whenDefined } from "./filterClause";

// ROUND: a true 200 summed as 199.999999999998 would drop out of min_calories=200
const CALORIES = `ROUND(${caloriesPerPortion("r")}::numeric, 2)`;

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
