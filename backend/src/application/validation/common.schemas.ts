import { z } from "zod";

import { FIELD_LIMITS } from "constants/fieldLimits";
import { LOCALES } from "constants/locales";
import { VALIDATION_MESSAGES } from "constants/validationMessages";

export function toNumber(value: unknown): unknown {
    const isEmptyInput = value == null || value === "";

    if (isEmptyInput) {
        return undefined;
    }

    if (typeof value === "string" || typeof value === "number") {
        return Number(value);
    }

    return value;
}

export function integerSchema() {
    return z.number().int();
}

export function positiveIntegerSchema() {
    return integerSchema().positive().max(FIELD_LIMITS.INT4_MAX);
}

export const idSchema = z.preprocess(toNumber, positiveIntegerSchema());

export function nonEmptyStringSchema() {
    return z.string().refine((value) => value.trim().length > 0, {
        message: VALIDATION_MESSAGES.NOT_EMPTY,
    });
}

export function trimmedStringSchema(maxLength: number) {
    return nonEmptyStringSchema()
        .transform((value) => value.trim())
        .pipe(z.string().max(maxLength));
}

export function hasUniqueItems<T>(
    items: T[],
    getKey: (item: T) => unknown = (item) => item,
): boolean {
    return new Set(items.map(getKey)).size === items.length;
}

export const UNIQUE_ITEMS = { message: VALIDATION_MESSAGES.UNIQUE };

export const contentLanguageSchema = z.enum(LOCALES);
