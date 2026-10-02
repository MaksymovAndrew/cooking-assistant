import { z } from "zod";

import { AVATAR_KEYS } from "constants/avatarKeys";
import { FIELD_LIMITS } from "constants/fieldLimits";
import { LOCALES } from "constants/locales";
import { VALIDATION_MESSAGES } from "constants/validationMessages";

import { nonEmptyStringSchema, trimmedStringSchema } from "./common.schemas";

const PASSWORD_MIN_LENGTH = 8;
// a letter in any alphabet counts as a letter, never as a special character
const PASSWORD_HAS_LETTER = /\p{L}/u;
const PASSWORD_HAS_DIGIT = /\d/;
const PASSWORD_HAS_SPECIAL_CHAR = /[^\p{L}\p{N}]/u;

const personTextSchema = trimmedStringSchema(FIELD_LIMITS.PERSON_TEXT_LENGTH);

function meetsPasswordRequirements(value: string): boolean {
    return (
        value.length >= PASSWORD_MIN_LENGTH &&
        PASSWORD_HAS_LETTER.test(value) &&
        PASSWORD_HAS_DIGIT.test(value) &&
        PASSWORD_HAS_SPECIAL_CHAR.test(value)
    );
}

// trimmed, format-checked, and lowercased so "Test@x.com" and "test@x.com" are the same account
export function emailSchema() {
    return z
        .string()
        .transform((value) => value.trim())
        .pipe(z.email().max(FIELD_LIMITS.PERSON_TEXT_LENGTH))
        .transform((value) => value.toLowerCase());
}

export function passwordSchema() {
    return z
        .string()
        .refine(meetsPasswordRequirements, {
            message: VALIDATION_MESSAGES.PASSWORD_RULES,
            params: { min: PASSWORD_MIN_LENGTH },
        })
        .refine(
            (value) =>
                Buffer.byteLength(value, "utf8") <= FIELD_LIMITS.PASSWORD_BYTES,
            {
                message: VALIDATION_MESSAGES.PASSWORD_TOO_LONG,
                params: { max: FIELD_LIMITS.PASSWORD_BYTES },
            },
        );
}

export const registerUserSchema = z.object({
    name: personTextSchema,
    surname: personTextSchema,
    // sign-in reads an identifier with @ as an email, so a login like that could never be used
    login: personTextSchema.refine((value) => !value.includes("@"), {
        message: VALIDATION_MESSAGES.LOGIN_WITHOUT_AT,
    }),
    email: emailSchema(),
    password: passwordSchema(),
});

export const loginUserSchema = z.object({
    login: trimmedStringSchema(FIELD_LIMITS.PERSON_TEXT_LENGTH),
    password: nonEmptyStringSchema(),
});

export const forgotPasswordSchema = z.object({
    email: emailSchema(),
});

export const resetPasswordSchema = z.object({
    token: nonEmptyStringSchema(),
    newPassword: passwordSchema(),
});

export const changePasswordSchema = z.object({
    currentPassword: nonEmptyStringSchema(),
    newPassword: passwordSchema(),
});

export const confirmEmailSchema = z.object({
    token: nonEmptyStringSchema(),
});

// avatar is a preset key or null (no avatar); an unknown string is rejected
export const updateProfileSchema = z.object({
    name: personTextSchema,
    surname: personTextSchema,
    avatar: z.enum(AVATAR_KEYS).nullable(),
});

export const updateLocaleSchema = z.object({
    locale: z.enum(LOCALES),
});

export const deleteAccountSchema = z.object({
    password: nonEmptyStringSchema(),
});
