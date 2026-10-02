import { z } from "zod";

import { FIELD_LIMITS } from "constants/fieldLimits";
import { LOCALES } from "constants/locales";
import { PAGINATION } from "constants/pagination";
import { VALIDATION_MESSAGES } from "constants/validationMessages";

import {
    hasUniqueItems,
    integerSchema,
    positiveIntegerSchema,
    toNumber,
    UNIQUE_ITEMS,
} from "./common.schemas";

const ID_LIST_PATTERN = /^\d+(,\d+)*$/;

// query strings carry booleans as text, so only the two literal spellings are accepted
export const booleanQuerySchema = z
    .string()
    .refine((value) => value === "true" || value === "false", {
        message: VALIDATION_MESSAGES.BOOLEAN_TEXT,
    })
    .transform((value) => value === "true")
    .optional();

// an id past int4 would make the ANY($n::int[]) cast fail in Postgres instead of matching nothing
export const idListStringSchema = z
    .string()
    .refine(
        (value) =>
            ID_LIST_PATTERN.test(value) &&
            value.split(",").every((id) => Number(id) <= FIELD_LIMITS.INT4_MAX),
        { message: VALIDATION_MESSAGES.ID_LIST },
    );

export function commaListSchema<const T extends readonly [string, ...string[]]>(
    values: T,
) {
    return z
        .string()
        .transform((value) => value.split(","))
        .pipe(
            z
                .array(z.enum(values))
                .refine((items) => hasUniqueItems(items), UNIQUE_ITEMS),
        )
        .optional();
}

export const languageListSchema = commaListSchema(LOCALES);

export const limitSchema = z.preprocess(
    toNumber,
    positiveIntegerSchema().max(PAGINATION.MAX_LIMIT).optional(),
);

export const offsetSchema = z.preprocess(
    toNumber,
    integerSchema().min(0).max(FIELD_LIMITS.INT4_MAX).optional(),
);
