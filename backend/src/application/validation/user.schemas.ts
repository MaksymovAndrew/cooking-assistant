import { z } from "zod";

import { nonEmptyStringSchema, trimmedStringSchema } from "./common.schemas";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_HAS_LETTER = /[A-Za-z]/;
const PASSWORD_HAS_DIGIT = /\d/;
const PASSWORD_HAS_SPECIAL_CHAR = /[^A-Za-z0-9]/;

function meetsPasswordRequirements(value: string): boolean {
    return (
        value.length >= PASSWORD_MIN_LENGTH &&
        PASSWORD_HAS_LETTER.test(value) &&
        PASSWORD_HAS_DIGIT.test(value) &&
        PASSWORD_HAS_SPECIAL_CHAR.test(value)
    );
}

// trimmed, format-checked, and lowercased so "Test@x.com" and "test@x.com" are the same account
export function emailSchema(field = "Email") {
    return z
        .string({
            required_error: `${field} is required`,
            invalid_type_error: `${field} must be a string`,
        })
        .transform((value) => value.trim())
        .pipe(z.string().email(`${field} must be a valid email address`))
        .transform((value) => value.toLowerCase());
}

export function passwordSchema(field = "Password") {
    return z
        .string({
            required_error: `${field} is required`,
            invalid_type_error: `${field} must be a string`,
        })
        .refine(meetsPasswordRequirements, {
            message: `${field} must be at least ${PASSWORD_MIN_LENGTH} characters and include a letter, a number, and a special character`,
        });
}

export const registerUserSchema = z.object({
    name: trimmedStringSchema("Name"),
    surname: trimmedStringSchema("Surname"),
    login: trimmedStringSchema("Login"),
    email: emailSchema(),
    password: passwordSchema(),
});

export const loginUserSchema = z.object({
    login: trimmedStringSchema("Login"),
    password: nonEmptyStringSchema("Password"),
});

export const forgotPasswordSchema = z.object({
    email: emailSchema(),
});

export const resetPasswordSchema = z.object({
    token: nonEmptyStringSchema("Token"),
    newPassword: passwordSchema("New password"),
});

export const changePasswordSchema = z.object({
    currentPassword: nonEmptyStringSchema("Current password"),
    newPassword: passwordSchema("New password"),
});

export const confirmEmailSchema = z.object({
    token: nonEmptyStringSchema("Token"),
});
