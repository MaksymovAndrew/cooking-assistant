// the languages the server can answer and write email in - each one needs a catalog folder under i18n/locales
export const LOCALES = ["en", "pl", "ru", "uk"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const isLocale = (value: string): value is Locale =>
    LOCALES.some((locale) => locale === value);
