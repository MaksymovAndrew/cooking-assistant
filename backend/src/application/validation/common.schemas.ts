import { z } from "zod";

import { PAGINATION } from "constants/pagination";

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

export const idSchema = z.preprocess(
    toNumber,
    z
        .number({
            required_error: "ID is required",
            invalid_type_error: "ID must be a number",
        })
        .int("ID must be an integer")
        .positive("ID must be positive"),
);

export function nonEmptyStringSchema(field: string) {
    return z
        .string({
            required_error: `${field} is required`,
            invalid_type_error: `${field} must be a string`,
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
            invalid_type_error: `${field} must be a string`,
        })
        .optional();
}

export function numberSchema(field: string) {
    return z.number({
        required_error: `${field} is required`,
        invalid_type_error: `${field} must be a number`,
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

export function idListStringSchema(field: string) {
    return z
        .string({
            invalid_type_error: `${field} must be a string`,
        })
        .regex(
            /^\d+(,\d+)*$/,
            `${field} must be a comma-separated list of IDs`,
        );
}

export const limitSchema = z.preprocess(
    toNumber,
    positiveIntegerSchema("Limit")
        .max(
            PAGINATION.MAX_LIMIT,
            `Limit must be at most ${PAGINATION.MAX_LIMIT}`,
        )
        .optional(),
);

export const offsetSchema = z.preprocess(
    toNumber,
    numberSchema("Offset")
        .int("Offset must be an integer")
        .min(0, "Offset must be at least 0")
        .optional(),
);
