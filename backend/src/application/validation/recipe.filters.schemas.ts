import { z } from "zod";

import { ALLERGEN_SLUGS } from "constants/allergens";
import type { RecipeFilters } from "domain/repositories/recipe.filters";

import {
    booleanQuerySchema,
    hasUniqueItems,
    idListStringSchema,
    limitSchema,
    offsetSchema,
    optionalStringSchema,
    positiveIntegerSchema,
    toNumber,
} from "./common.schemas";

// caps how many ids this filter accepts, since the catalog has hundreds of entries and a search match can surface many
const MAX_INGREDIENT_FILTER_IDS = 20;

const quote = (value: string): string => `'${value}'`;

// output shape is checked against the domain's RecipeFilters below - the repository interface is typed against that, not against this schema
export const recipeFiltersSchema = z.object({
    recipe_name: optionalStringSchema("Recipe name"),
    ingredient_ids: idListStringSchema("Ingredient IDs")
        .refine(
            (value) => value.split(",").length <= MAX_INGREDIENT_FILTER_IDS,
            `Ingredient IDs must be at most ${MAX_INGREDIENT_FILTER_IDS} items`,
        )
        .optional(),
    type_ids: idListStringSchema("Type IDs").optional(),
    start_date: z.iso
        .date({
            error: (issue) =>
                issue.code === "invalid_type"
                    ? "Start date must be a string"
                    : "Start date must be a YYYY-MM-DD date",
        })
        .optional(),
    end_date: z.iso
        .date({
            error: (issue) =>
                issue.code === "invalid_type"
                    ? "End date must be a string"
                    : "End date must be a YYYY-MM-DD date",
        })
        .optional(),
    min_cooking_time: z.preprocess(
        toNumber,
        positiveIntegerSchema("Min cooking time").optional(),
    ),
    max_cooking_time: z.preprocess(
        toNumber,
        positiveIntegerSchema("Max cooking time").optional(),
    ),
    min_calories: z.preprocess(
        toNumber,
        positiveIntegerSchema("Min calories").optional(),
    ),
    max_calories: z.preprocess(
        toNumber,
        positiveIntegerSchema("Max calories").optional(),
    ),
    sort_order: z
        .enum(["asc", "desc", "rating"], {
            error: (issue) => {
                const expected = issue.values
                    .map((value) => quote(String(value)))
                    .join(" | ");

                return `Invalid enum value. Expected ${expected}, received ${quote(String(issue.input))}`;
            },
        })
        .optional(),
    in_pantry: booleanQuerySchema("In pantry"),
    favourites: booleanQuerySchema("Favourites"),
    top_rated: booleanQuerySchema("Top rated"),
    exclude_allergens: z
        .string({ error: "Exclude allergens must be a string" })
        .transform((value) => value.split(","))
        .pipe(
            z
                .array(
                    z.enum(ALLERGEN_SLUGS, {
                        error: "Exclude allergens must be a comma-separated list of allergens",
                    }),
                )
                .refine((slugs) => hasUniqueItems(slugs), {
                    message: "Exclude allergens must be unique",
                }),
        )
        .optional(),
    hide_avoided: booleanQuerySchema("Hide avoided"),
    tag_ids: idListStringSchema("Tag IDs").optional(),
    limit: limitSchema,
    offset: offsetSchema,
}) satisfies z.ZodType<RecipeFilters>;
