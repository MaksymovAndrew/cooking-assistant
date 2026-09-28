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

export const MAX_DISCARDED_PURCHASES = 500;

export const discardPurchasesSchema = z
    .array(positiveIntegerSchema("Purchase ID"), {
        error: requiredOrInvalidType(
            "Purchase IDs are required",
            "Purchase IDs must be an array",
        ),
    })
    .min(1, { message: "Purchase IDs are required" })
    .max(MAX_DISCARDED_PURCHASES, {
        message: `Cannot discard more than ${MAX_DISCARDED_PURCHASES} purchases at once`,
    })
    .refine((ids) => hasUniqueItems(ids), {
        message: "Purchase IDs must be unique",
    });

export const purchaseQuantitySchema = z
    .number({
        error: requiredOrInvalidType(
            "Quantity cannot be empty.",
            "Quantity must be a number",
        ),
    })
    .positive("Quantity must be greater than 0");
