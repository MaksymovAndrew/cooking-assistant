import { z } from "zod";

import {
    hasUniqueItems,
    numberSchema,
    positiveIntegerSchema,
    requiredOrInvalidType,
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
            { error: INCORRECT_FORMAT_MESSAGE },
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
        error: requiredOrInvalidType(
            "Quantity cannot be empty.",
            "Quantity must be a number",
        ),
    })
    .positive("Quantity must be greater than 0");
