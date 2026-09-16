import { z } from "zod";

import { SHOPPING_LIST_LIMITS } from "constants/shoppingList";

import {
    hasUniqueItems,
    numberSchema,
    positiveIntegerSchema,
    trimmedStringSchema,
} from "./common.schemas";

const { MAX_ITEMS, MAX_NAME_LENGTH, MAX_NOTE_LENGTH } = SHOPPING_LIST_LIMITS;

const INCORRECT_FORMAT_MESSAGE = "Incorrect data format";

const nameSchema = trimmedStringSchema("Name").pipe(
    z
        .string()
        .max(
            MAX_NAME_LENGTH,
            `Name must be at most ${MAX_NAME_LENGTH} characters`,
        ),
);

// a blank note means "no note", so it is stored as null rather than an empty string
const noteSchema = z
    .string({ error: "Note must be a string" })
    .trim()
    .max(MAX_NOTE_LENGTH, `Note must be at most ${MAX_NOTE_LENGTH} characters`)
    .transform((value) => (value === "" ? null : value))
    .nullable();

export const createShoppingListItemSchema = z.object({
    name: nameSchema,
    note: noteSchema.optional(),
});

export const updateShoppingListItemSchema = z
    .object({
        name: nameSchema.optional(),
        note: noteSchema.optional(),
        checked: z
            .boolean({ error: "Checked must be true or false" })
            .optional(),
    })
    .refine(
        (changes) =>
            Object.values(changes).some(
                (value) => typeof value !== "undefined",
            ),
        { message: "Provide at least one field to update" },
    );

export const reorderShoppingListSchema = z.object({
    ids: z
        .array(positiveIntegerSchema("Item ID"), {
            error: INCORRECT_FORMAT_MESSAGE,
        })
        .max(MAX_ITEMS, `IDs must contain at most ${MAX_ITEMS} items`)
        .refine((ids) => hasUniqueItems(ids), {
            message: "Item IDs must be unique",
        }),
});

export const addIngredientsToShoppingListSchema = z.object({
    items: z
        .array(
            z.object({
                ingredient_id: positiveIntegerSchema("Ingredient ID"),
                quantity: numberSchema("Quantity").positive(
                    "Quantity must be greater than 0",
                ),
            }),
            { error: INCORRECT_FORMAT_MESSAGE },
        )
        .min(1, "Items cannot be empty")
        .max(MAX_ITEMS, `Items must contain at most ${MAX_ITEMS} entries`)
        .refine(
            (items) => hasUniqueItems(items, (item) => item.ingredient_id),
            { message: "Ingredient IDs must be unique" },
        ),
});
