import { z } from "zod";

import {
    contentLanguageSchema,
    hasUniqueItems,
    idSchema,
    nonEmptyStringSchema,
    numberSchema,
    positiveIntegerSchema,
    requiredOrInvalidType,
} from "./common.schemas";

// both quantity field names are accepted and unified into quantity_recipe_ingredients
const recipeIngredientSchema = z
    .object({
        id: positiveIntegerSchema("Ingredient ID"),
        quantity: numberSchema("Quantity")
            .positive("Quantity must be positive")
            .optional(),
        quantity_recipe_ingredients: numberSchema("Recipe ingredient quantity")
            .positive("Recipe ingredient quantity must be positive")
            .optional(),
    })
    .transform(({ id, quantity, quantity_recipe_ingredients }) => ({
        id,
        quantity_recipe_ingredients:
            quantity_recipe_ingredients ?? quantity ?? 1,
    }));

export const createRecipeSchema = z.object({
    title: nonEmptyStringSchema("Title"),
    content: nonEmptyStringSchema("Content"),
    language: contentLanguageSchema,
    person_id: idSchema,
    ingredients: z
        .array(recipeIngredientSchema, {
            error: requiredOrInvalidType(
                "Ingredients are required",
                "Ingredients must be an array",
            ),
        })
        .refine((items) => hasUniqueItems(items, (item) => item.id), {
            message: "Ingredient IDs must be unique",
        }),
    type_id: positiveIntegerSchema("Recipe type ID").optional(),
    cooking_time: positiveIntegerSchema("Cooking time").optional(),
    // manual per-portion calorie value; null clears it back to the computed total
    calories_override: numberSchema("Calories override")
        .nonnegative("Calories override must not be negative")
        .nullable()
        .optional(),
});

export const updateRecipeSchema = createRecipeSchema.omit({
    person_id: true,
});
