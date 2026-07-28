import { z } from "zod";

import {
    hasUniqueItems,
    numberSchema,
    positiveIntegerSchema,
} from "./common.schemas";

const INCORRECT_FORMAT_MESSAGE = "Incorrect data format";

// the create and update payloads share one shape and differ only in the lowest quantity they accept (create must be above 0, update allows zeroing out)
const buildPantryIngredientsSchema = (quantitySchema: z.ZodNumber) =>
    z
        .array(
            z.object({
                id: positiveIntegerSchema("Ingredient ID"),
                quantity_person_ingradient: quantitySchema,
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
    numberSchema("Quantity").positive("Quantity must be greater than 0"),
);

export const pantryUpdateIngredientsSchema = buildPantryIngredientsSchema(
    numberSchema("Quantity").min(0, "Quantity must be 0 or more"),
);

export const purchaseQuantitySchema = z
    .number({
        required_error: "Quantity cannot be empty.",
        invalid_type_error: "Quantity must be a number",
    })
    .positive("Quantity must be greater than 0");
