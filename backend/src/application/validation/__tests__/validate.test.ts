import { z } from "zod";

import { ERROR_CODES } from "constants/errorCodes";
import { VALIDATION_MESSAGES } from "constants/validationMessages";
import { ValidationError } from "domain/errors/AppError";
import { translateValidationIssues } from "i18n/translate";

import { validate } from "application/validation/validate";

import { catchSyncError } from "test/helpers/assertions";

function rejection(schema: z.ZodType, input: unknown): unknown {
    return catchSyncError(() => {
        validate(schema, input);
    });
}

// the English text the error renders to at the HTTP edge
function detailOf(schema: z.ZodType, input: unknown): string | null {
    const error = rejection(schema, input);

    return error instanceof ValidationError
        ? translateValidationIssues(error.issues, "en")
        : null;
}

describe("validate", () => {
    it("should return the parsed value when the input matches", () => {
        expect(validate(z.object({ n: z.number() }), { n: 3 })).toEqual({
            n: 3,
        });
    });

    it("should throw a 400 ValidationError carrying every rejected field", () => {
        expect(rejection(z.object({ title: z.string() }), {})).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            "title: Required",
        );
    });

    it("should report a field that was not sent as required", () => {
        expect(detailOf(z.object({ title: z.string() }), {})).toBe(
            "title: Required",
        );
    });

    it.each([
        [z.string(), 5, "Must be text"],
        [z.number(), "5", "Must be a number"],
        [z.number().int(), 1.5, "Must be a whole number"],
        [z.boolean(), "yes", "Must be true or false"],
        [z.array(z.number()), "1,2", "Must be a list"],
        [z.object({}), "x", "Must be an object"],
        [z.date(), "2026-01-01", "Has the wrong type"],
    ])("should name the expected type of %s", (schema, input, text) => {
        expect(detailOf(z.object({ value: schema }), { value: input })).toBe(
            `value: ${text}`,
        );
    });

    it.each([
        [z.number().min(2), 1, "Must be at least 2"],
        [z.number().positive(), 0, "Must be greater than 0"],
        [z.number().max(5), 6, "Must be at most 5"],
        [z.number().lt(5), 5, "Must be less than 5"],
        [z.string().min(3), "ab", "Must be at least 3 characters"],
        [z.string().max(2), "abc", "Must be at most 2 characters"],
        [z.array(z.number()).min(2), [1], "Must have at least 2 items"],
        [z.array(z.number()).max(1), [1, 2], "Must have at most 1 items"],
        [z.array(z.number()).min(1), [], "Cannot be empty"],
    ])("should put the bound of %s into the message", (schema, input, text) => {
        expect(detailOf(z.object({ value: schema }), { value: input })).toBe(
            `value: ${text}`,
        );
    });

    it.each([
        [z.email(), "nope", "Must be a valid email address"],
        [z.iso.date(), "2026-13-01", "Must be a YYYY-MM-DD date"],
        [z.iso.datetime(), "today", "Must be an ISO date and time"],
        [z.string().regex(/^\d+$/), "abc", "Has the wrong format"],
        [z.enum(["asc", "desc"]), "up", "Must be one of: asc, desc"],
        [z.union([z.string(), z.number()]), true, "Is not valid"],
    ])("should describe a malformed %s", (schema, input, text) => {
        expect(detailOf(z.object({ value: schema }), { value: input })).toBe(
            `value: ${text}`,
        );
    });

    it("should use the schema's own message key with its parameters", () => {
        const schema = z.object({
            ids: z.string().refine(() => false, {
                message: VALIDATION_MESSAGES.MAX_ITEMS,
                params: { max: 20 },
            }),
        });

        expect(detailOf(schema, { ids: "1" })).toBe(
            "ids: Must have at most 20 items",
        );
    });

    it("should leave a message unprefixed when the issue names no field", () => {
        const schema = z
            .object({ a: z.number().optional() })
            .refine(() => false, {
                message: VALIDATION_MESSAGES.AT_LEAST_ONE_FIELD,
            });

        expect(detailOf(schema, {})).toBe(
            "Provide at least one field to update",
        );
    });

    it("should join every rejected field and name nested ones by their path", () => {
        const schema = z.object({
            title: z.string(),
            items: z.array(z.object({ id: z.number() })),
        });

        expect(detailOf(schema, { items: [{ id: "x" }] })).toBe(
            "title: Required; items.0.id: Must be a number",
        );
    });
});
