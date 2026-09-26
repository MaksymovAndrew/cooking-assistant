import { z } from "zod";

import { LOCALES } from "constants/locales";

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

// zod 4 unifies required/invalid-type into one error callback; issue.input is undefined exactly for a missing field
export function requiredOrInvalidType(
    requiredMessage: string,
    invalidTypeMessage: string,
) {
    return (issue: { input?: unknown }): string =>
        typeof issue.input === "undefined"
            ? requiredMessage
            : invalidTypeMessage;
}

export const idSchema = z.preprocess(
    toNumber,
    z
        .number({
            error: requiredOrInvalidType(
                "ID is required",
                "ID must be a number",
            ),
        })
        .int("ID must be an integer")
        .positive("ID must be positive"),
);

export function nonEmptyStringSchema(field: string) {
    return z
        .string({
            error: requiredOrInvalidType(
                `${field} is required`,
                `${field} must be a string`,
            ),
        })
        .refine((value) => value.trim().length > 0, {
            message: `${field} cannot be empty`,
        });
}
export function trimmedStringSchema(field: string) {
    return nonEmptyStringSchema(field).transform((value) => value.trim());
}

export function optionalStringSchema(field: string) {
    return z
        .string({
            error: `${field} must be a string`,
        })
        .optional();
}

export function numberSchema(field: string) {
    return z.number({
        error: requiredOrInvalidType(
            `${field} is required`,
            `${field} must be a number`,
        ),
    });
}

export function integerSchema(field: string) {
    return numberSchema(field).int(`${field} must be an integer`);
}

export function positiveIntegerSchema(field: string) {
    return integerSchema(field).positive(`${field} must be positive`);
}

export function hasUniqueItems<T>(
    items: T[],
    getKey: (item: T) => unknown = (item) => item,
): boolean {
    return new Set(items.map(getKey)).size === items.length;
}

// the language a recipe or menu is written in, picked by its author
export const contentLanguageSchema = z.enum(LOCALES, {
    error: requiredOrInvalidType(
        "Language is required",
        `Language must be one of ${LOCALES.join(", ")}`,
    ),
});
