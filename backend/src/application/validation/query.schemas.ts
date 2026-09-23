import { z } from "zod";

import { PAGINATION } from "constants/pagination";

import {
    numberSchema,
    positiveIntegerSchema,
    toNumber,
} from "./common.schemas";

// query strings carry booleans as text, so only the two literal spellings are accepted
export function booleanQuerySchema(field: string) {
    return z
        .string({ error: `${field} must be true or false` })
        .refine((value) => value === "true" || value === "false", {
            message: `${field} must be true or false`,
        })
        .transform((value) => value === "true")
        .optional();
}

export function idListStringSchema(field: string) {
    return z
        .string({
            error: `${field} must be a string`,
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
