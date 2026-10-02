import { z } from "zod";

import { EXACTLY_ONE_SOURCE_MESSAGE } from "./calorie.schemas";
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

export const MAX_COOKED_PORTIONS = 100;

// the output names its one source, so the use case never meets a "neither" branch zod already ruled out
export const cookSchema = z
    .object({
        recipe_id: positiveIntegerSchema("Recipe ID").optional(),
        menu_id: positiveIntegerSchema("Menu ID").optional(),
        portions: positiveIntegerSchema("Portions").max(MAX_COOKED_PORTIONS, {
            message: `Portions cannot exceed ${MAX_COOKED_PORTIONS}`,
        }),
        log_calories: z
            .boolean({ error: "Log calories must be a boolean" })
            .default(false),
    })
    .transform(({ recipe_id, menu_id, portions, log_calories }, ctx) => {
        const recipeOnly =
            typeof recipe_id === "number" && typeof menu_id === "undefined";
        const menuOnly =
            typeof menu_id === "number" && typeof recipe_id === "undefined";

        if (recipeOnly) {
            return { source: { recipeId: recipe_id }, portions, log_calories };
        }

        if (menuOnly) {
            return { source: { menuId: menu_id }, portions, log_calories };
        }

        ctx.addIssue({
            code: "custom",
            message: EXACTLY_ONE_SOURCE_MESSAGE,
            path: ["recipe_id"],
        });

        return z.NEVER;
    });
