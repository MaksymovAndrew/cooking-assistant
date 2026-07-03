import { z } from "zod";

import {
    hasUniqueItems,
    idListStringSchema,
    idSchema,
    limitSchema,
    nonEmptyStringSchema,
    numberSchema,
    offsetSchema,
    optionalStringSchema,
    positiveIntegerSchema,
    toNumber,
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
    person_id: idSchema,
    ingredients: z
        .array(recipeIngredientSchema, {
            required_error: "Ingredients are required",
            invalid_type_error: "Ingredients must be an array",
        })
        .refine((items) => hasUniqueItems(items, (item) => item.id), {
            message: "Ingredient IDs must be unique",
        }),
    type_id: positiveIntegerSchema("Recipe type ID").optional(),
    cooking_time: positiveIntegerSchema("Cooking time").optional(),
    servings: z.preprocess(
        toNumber,
        positiveIntegerSchema("Servings").optional(),
    ),
});

export const updateRecipeSchema = createRecipeSchema.omit({
    person_id: true,
});

export const recipeFiltersSchema = z.object({
    ingredient_name: optionalStringSchema("Ingredient name"),
    type_ids: idListStringSchema("Type IDs").optional(),
    start_date: z
        .string({ invalid_type_error: "Start date must be a string" })
        .date("Start date must be a YYYY-MM-DD date")
        .optional(),
    end_date: z
        .string({ invalid_type_error: "End date must be a string" })
        .date("End date must be a YYYY-MM-DD date")
        .optional(),
    min_cooking_time: z.preprocess(
        toNumber,
        positiveIntegerSchema("Min cooking time").optional(),
    ),
    max_cooking_time: z.preprocess(
        toNumber,
        positiveIntegerSchema("Max cooking time").optional(),
    ),
    sort_order: z.enum(["asc", "desc"]).optional(),
    limit: limitSchema,
    offset: offsetSchema,
});
