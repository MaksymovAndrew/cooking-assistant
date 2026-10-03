import type { ErrorCode } from "constants/errorCodes";
import type { Locale } from "constants/locales";
import type { ValidationMessage } from "constants/validationMessages";
import type { ValidationIssue } from "domain/errors/AppError";

import enEmail from "./locales/en/email.json";
import enErrors from "./locales/en/errors.json";
import enMessages from "./locales/en/messages.json";
import enValidation from "./locales/en/validation.json";
import plEmail from "./locales/pl/email.json";
import plErrors from "./locales/pl/errors.json";
import plMessages from "./locales/pl/messages.json";
import plValidation from "./locales/pl/validation.json";
import ruEmail from "./locales/ru/email.json";
import ruErrors from "./locales/ru/errors.json";
import ruMessages from "./locales/ru/messages.json";
import ruValidation from "./locales/ru/validation.json";
import ukEmail from "./locales/uk/email.json";
import ukErrors from "./locales/uk/errors.json";
import ukMessages from "./locales/uk/messages.json";
import ukValidation from "./locales/uk/validation.json";

export type MessageKey = keyof typeof enMessages;
export type EmailCopy = typeof enEmail;

interface Catalog {
    errors: Record<ErrorCode, string>;
    messages: Record<MessageKey, string>;
    email: EmailCopy;
    validation: Record<ValidationMessage, string>;
}

// en defines the keys; satisfies makes a missing locale or key a compile error
const CATALOGS = {
    en: {
        errors: enErrors,
        messages: enMessages,
        email: enEmail,
        validation: enValidation,
    },
    pl: {
        errors: plErrors,
        messages: plMessages,
        email: plEmail,
        validation: plValidation,
    },
    ru: {
        errors: ruErrors,
        messages: ruMessages,
        email: ruEmail,
        validation: ruValidation,
    },
    uk: {
        errors: ukErrors,
        messages: ukMessages,
        email: ukEmail,
        validation: ukValidation,
    },
} satisfies Record<Locale, Catalog>;

export function translateError(code: ErrorCode, locale: Locale): string {
    return CATALOGS[locale].errors[code];
}

export function translateMessage(key: MessageKey, locale: Locale): string {
    return CATALOGS[locale].messages[key];
}

export function getEmailCopy(locale: Locale): EmailCopy {
    return CATALOGS[locale].email;
}

function interpolate(
    template: string,
    params: ValidationIssue["params"],
): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
        name in params ? String(params[name]) : match,
    );
}

export function translateValidationIssues(
    issues: readonly ValidationIssue[],
    locale: Locale,
): string {
    return issues
        .map((issue) => {
            const text = interpolate(
                CATALOGS[locale].validation[issue.message],
                issue.params,
            );

            return issue.path ? `${issue.path}: ${text}` : text;
        })
        .join("; ");
}
