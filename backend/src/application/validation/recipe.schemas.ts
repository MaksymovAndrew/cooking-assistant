import { z } from "zod";

import { FIELD_LIMITS } from "constants/fieldLimits";

import {
    contentLanguageSchema,
    hasUniqueItems,
    idSchema,
    nonEmptyStringSchema,
    positiveIntegerSchema,
    UNIQUE_ITEMS,
} from "./common.schemas";

// both quantity field names are accepted and unified into quantity_recipe_ingredients
const recipeIngredientSchema = z
    .object({
        id: positiveIntegerSchema(),
        quantity: z.number().positive().optional(),
        quantity_recipe_ingredients: z.number().positive().optional(),
    })
    .transform(({ id, quantity, quantity_recipe_ingredients }) => ({
        id,
        quantity_recipe_ingredients:
            quantity_recipe_ingredients ?? quantity ?? 1,
    }));

export const createRecipeSchema = z.object({
    title: nonEmptyStringSchema().max(FIELD_LIMITS.RECIPE_TITLE_LENGTH),
    content: nonEmptyStringSchema(),
    language: contentLanguageSchema,
    person_id: idSchema,
    ingredients: z
        .array(recipeIngredientSchema)
        .max(FIELD_LIMITS.MAX_RECIPE_INGREDIENTS)
        .refine(
            (items) => hasUniqueItems(items, (item) => item.id),
            UNIQUE_ITEMS,
        ),
    type_id: positiveIntegerSchema().optional(),
    cooking_time: positiveIntegerSchema().optional(),
    // manual per-portion calorie value; null clears it back to the computed total
    calories_override: z.number().nonnegative().nullable().optional(),
});

export const updateRecipeSchema = createRecipeSchema.omit({
    person_id: true,
});
