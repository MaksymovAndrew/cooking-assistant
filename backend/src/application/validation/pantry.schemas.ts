import { z } from "zod";

import { FIELD_LIMITS } from "constants/fieldLimits";

import { singleSource, sourceIdFields } from "./calorie.schemas";
import {
    hasUniqueItems,
    positiveIntegerSchema,
    UNIQUE_ITEMS,
} from "./common.schemas";

export const pantryIngredientsSchema = z
    .array(
        z.object({
            id: positiveIntegerSchema(),
            quantity_person_ingradient: z.number().positive(),
        }),
    )
    .max(FIELD_LIMITS.MAX_PANTRY_ITEMS)
    .refine((items) => hasUniqueItems(items, (item) => item.id), UNIQUE_ITEMS);

export const MAX_DISCARDED_PURCHASES = 500;

export const discardPurchasesSchema = z
    .array(positiveIntegerSchema())
    .min(1)
    .max(MAX_DISCARDED_PURCHASES)
    .refine((ids) => hasUniqueItems(ids), UNIQUE_ITEMS);

export const purchaseQuantitySchema = z.number().positive();

export const MAX_COOKED_PORTIONS = 100;

export const cookSchema = z
    .object({
        ...sourceIdFields,
        portions: positiveIntegerSchema().max(MAX_COOKED_PORTIONS),
        log_calories: z.boolean().default(false),
    })
    .transform(({ portions, log_calories, ...ids }, ctx) => ({
        source: singleSource(ids, ctx),
        portions,
        log_calories,
    }));
