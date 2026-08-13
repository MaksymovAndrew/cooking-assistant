import { z } from "zod";

import {
    hasUniqueItems,
    numberSchema,
    positiveIntegerSchema,
    requiredOrInvalidType,
} from "./common.schemas";

const INCORRECT_FORMAT_MESSAGE = "Incorrect data format";

export const pantryIngredientsSchema = z
    .array(
        z.object({
            id: positiveIntegerSchema("Ingredient ID"),
            quantity_person_ingradient: numberSchema("Quantity").positive(
                "Quantity must be greater than 0",
            ),
        }),
        { error: INCORRECT_FORMAT_MESSAGE },
    )
    .refine((items) => hasUniqueItems(items, (item) => item.id), {
        message: "Ingredient IDs must be unique",
    });

export const purchaseQuantitySchema = z
    .number({
        error: requiredOrInvalidType(
            "Quantity cannot be empty.",
            "Quantity must be a number",
        ),
    })
    .positive("Quantity must be greater than 0");
