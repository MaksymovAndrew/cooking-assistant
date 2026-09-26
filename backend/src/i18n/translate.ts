import type { ErrorCode } from "constants/errorCodes";
import type { Locale } from "constants/locales";

import enEmail from "./locales/en/email.json";
import enErrors from "./locales/en/errors.json";
import enMessages from "./locales/en/messages.json";
import plEmail from "./locales/pl/email.json";
import plErrors from "./locales/pl/errors.json";
import plMessages from "./locales/pl/messages.json";
import ruEmail from "./locales/ru/email.json";
import ruErrors from "./locales/ru/errors.json";
import ruMessages from "./locales/ru/messages.json";
import ukEmail from "./locales/uk/email.json";
import ukErrors from "./locales/uk/errors.json";
import ukMessages from "./locales/uk/messages.json";

export type MessageKey = keyof typeof enMessages;
export type EmailCopy = typeof enEmail;

interface Catalog {
    errors: Record<ErrorCode, string>;
    messages: Record<MessageKey, string>;
    email: EmailCopy;
}

// en is the reference locale: its files define the keys, and a new locale is one LOCALES entry plus one folder and
// one entry here - satisfies turns a missing locale, or a missing key in any locale, into a compile error
const CATALOGS = {
    en: { errors: enErrors, messages: enMessages, email: enEmail },
    pl: { errors: plErrors, messages: plMessages, email: plEmail },
    ru: { errors: ruErrors, messages: ruMessages, email: ruEmail },
    uk: { errors: ukErrors, messages: ukMessages, email: ukEmail },
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
