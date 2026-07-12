import { z } from "zod";

import {
    hasUniqueItems,
    integerSchema,
    positiveIntegerSchema,
} from "./common.schemas";

const INCORRECT_FORMAT_MESSAGE = "Incorrect data format";

// the create and update payloads share one shape and differ only in the lowest quantity they accept (create starts at 1, update allows zeroing out)
const buildPantryIngredientsSchema = (
    minQuantity: number,
    minQuantityMessage: string,
) =>
    z
        .array(
            z.object({
                id: positiveIntegerSchema("Ingredient ID"),
                quantity_person_ingradient: integerSchema("Quantity").min(
                    minQuantity,
                    minQuantityMessage,
                ),
            }),
            {
                required_error: INCORRECT_FORMAT_MESSAGE,
                invalid_type_error: INCORRECT_FORMAT_MESSAGE,
            },
        )
        .refine((items) => hasUniqueItems(items, (item) => item.id), {
            message: "Ingredient IDs must be unique",
        });

export const pantryIngredientsSchema = buildPantryIngredientsSchema(
    1,
    "Quantity must be at least 1",
);

export const pantryUpdateIngredientsSchema = buildPantryIngredientsSchema(
    0,
    "Quantity must be 0 or more",
);

export const purchaseQuantitySchema = z
    .number({
        required_error: "Quantity cannot be empty.",
        invalid_type_error: "Quantity must be a number",
    })
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1");
