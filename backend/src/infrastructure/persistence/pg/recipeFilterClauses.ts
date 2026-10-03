import type { RecipeFilters } from "domain/repositories/recipe.filters";

import { contentLanguageFilterClause } from "./contentLanguageFilterClause";
import { DIET_FILTER_CLAUSES } from "./dietFilterClauses";
import { favouritesFilterClause } from "./favouritesFilterClause";
import { type FilterClause, whenDefined } from "./filterClause";
import { pantryFilterClause } from "./pantryFilterClause";
import { topRatedFilterClause } from "./ratingColumns";
import { RECIPE_RANGE_FILTER_CLAUSES } from "./recipeRangeFilterClauses";
import { escapeLikePattern } from "./sqlFilterBuilder";
import { tagsFilterClause } from "./tagsFilterClause";

export const RECIPE_FILTER_CLAUSES: readonly FilterClause<RecipeFilters>[] = [
    whenDefined("recipe_name", (builder, recipeName) => {
        const likePattern = `%${escapeLikePattern(recipeName)}%`;

        builder.add((bind) => `r.title ILIKE ${bind(likePattern)}`);
    }),
    whenDefined("ingredient_ids", (builder, ingredientIds) => {
        const ids = ingredientIds.split(",").map(Number);

        // an EXISTS, not a WHERE on the join, so the json_agg keeps the recipe's other ingredients
        builder.add(
            (bind) => `EXISTS (
        SELECT 1 FROM recipe_ingredients ri2
        WHERE ri2.recipe_id = r.id AND ri2.ingredient_id = ANY(${bind(ids)}::int[])
      )`,
        );
    }),
    whenDefined("type_ids", (builder, typeIds) => {
        const ids = typeIds.split(",").map(Number);

        builder.add((bind) => `r.type_id = ANY(${bind(ids)}::int[])`);
    }),
    whenDefined("start_date", (builder, startDate) => {
        builder.add((bind) => `r.creation_date >= ${bind(startDate)}::date`);
    }),
    // a date names its whole day, so the bound is the start of the next one
    whenDefined("end_date", (builder, endDate) => {
        builder.add((bind) => `r.creation_date < ${bind(endDate)}::date + 1`);
    }),
    ...RECIPE_RANGE_FILTER_CLAUSES,
    pantryFilterClause,
    favouritesFilterClause("recipe", "r.id"),
    topRatedFilterClause("r"),
    ...DIET_FILTER_CLAUSES,
    tagsFilterClause,
    contentLanguageFilterClause("r"),
];
