import { z } from "zod";

import { SHOPPING_LIST_LIMITS } from "constants/shoppingList";
import { VALIDATION_MESSAGES } from "constants/validationMessages";

import {
    hasUniqueItems,
    positiveIntegerSchema,
    trimmedStringSchema,
    UNIQUE_ITEMS,
} from "./common.schemas";

const { MAX_ITEMS, MAX_NAME_LENGTH, MAX_NOTE_LENGTH } = SHOPPING_LIST_LIMITS;

const noteSchema = z
    .string()
    .trim()
    .max(MAX_NOTE_LENGTH)
    .transform((value) => (value === "" ? null : value))
    .nullable();

export const createShoppingListItemSchema = z.object({
    name: trimmedStringSchema(MAX_NAME_LENGTH),
    note: noteSchema.optional(),
});

export const updateShoppingListItemSchema = z
    .object({
        note: noteSchema.optional(),
        checked: z.boolean().optional(),
    })
    .refine(
        (changes) =>
            Object.values(changes).some(
                (value) => typeof value !== "undefined",
            ),
        { message: VALIDATION_MESSAGES.AT_LEAST_ONE_FIELD },
    );

export const reorderShoppingListSchema = z.object({
    ids: z
        .array(positiveIntegerSchema())
        .max(MAX_ITEMS)
        .refine((ids) => hasUniqueItems(ids), UNIQUE_ITEMS),
});

export const addIngredientsToShoppingListSchema = z.object({
    items: z
        .array(
            z.object({
                ingredient_id: positiveIntegerSchema(),
                // null adds the ingredient by name alone, leaving the amount to the shopper
                quantity: z.number().positive().nullable(),
            }),
        )
        .min(1)
        .max(MAX_ITEMS)
        .refine(
            (items) => hasUniqueItems(items, (item) => item.ingredient_id),
            UNIQUE_ITEMS,
        ),
});
