import { z } from "zod";

import { ALLERGEN_SLUGS } from "constants/allergens";
import { VALIDATION_MESSAGES } from "constants/validationMessages";
import type { RecipeFilters } from "domain/repositories/recipe.filters";

import { positiveIntegerSchema, toNumber } from "./common.schemas";
import {
    booleanQuerySchema,
    commaListSchema,
    idListStringSchema,
    languageListSchema,
    limitSchema,
    offsetSchema,
} from "./query.schemas";

// bounded: the catalog has hundreds of entries and a search can match many
const MAX_INGREDIENT_FILTER_IDS = 20;

const optionalPositiveInteger = z.preprocess(
    toNumber,
    positiveIntegerSchema().optional(),
);

export const recipeFiltersSchema = z.object({
    recipe_name: z.string().optional(),
    ingredient_ids: idListStringSchema
        .refine(
            (value) => value.split(",").length <= MAX_INGREDIENT_FILTER_IDS,
            {
                message: VALIDATION_MESSAGES.MAX_ITEMS,
                params: { max: MAX_INGREDIENT_FILTER_IDS },
            },
        )
        .optional(),
    type_ids: idListStringSchema.optional(),
    start_date: z.iso.date().optional(),
    end_date: z.iso.date().optional(),
    min_cooking_time: optionalPositiveInteger,
    max_cooking_time: optionalPositiveInteger,
    min_calories: optionalPositiveInteger,
    max_calories: optionalPositiveInteger,
    sort_order: z.enum(["asc", "desc", "rating"]).optional(),
    in_pantry: booleanQuerySchema,
    favourites: booleanQuerySchema,
    top_rated: booleanQuerySchema,
    exclude_allergens: commaListSchema(ALLERGEN_SLUGS),
    hide_avoided: booleanQuerySchema,
    tag_ids: idListStringSchema.optional(),
    languages: languageListSchema,
    limit: limitSchema,
    offset: offsetSchema,
}) satisfies z.ZodType<RecipeFilters>;
