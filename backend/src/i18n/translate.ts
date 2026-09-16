import type { ErrorCode } from "constants/errorCodes";

import enEmail from "./locales/en/email.json";
import enErrors from "./locales/en/errors.json";
import enMessages from "./locales/en/messages.json";

export type MessageKey = keyof typeof enMessages;
export type EmailCopy = typeof enEmail;

interface Catalog {
    errors: Record<ErrorCode, string>;
    messages: Record<MessageKey, string>;
    email: EmailCopy;
}

// en is the reference locale: its files define the keys, and a new locale is one more folder plus one entry here -
// satisfies turns a missing key in any locale into a compile error
const CATALOGS = {
    en: { errors: enErrors, messages: enMessages, email: enEmail },
} satisfies Record<string, Catalog>;

export type Locale = keyof typeof CATALOGS;

export const DEFAULT_LOCALE: Locale = "en";

export function translateError(
    code: ErrorCode,
    locale: Locale = DEFAULT_LOCALE,
): string {
    return CATALOGS[locale].errors[code];
}

export function translateMessage(
    key: MessageKey,
    locale: Locale = DEFAULT_LOCALE,
): string {
    return CATALOGS[locale].messages[key];
}

export function getEmailCopy(locale: Locale = DEFAULT_LOCALE): EmailCopy {
    return CATALOGS[locale].email;
}
