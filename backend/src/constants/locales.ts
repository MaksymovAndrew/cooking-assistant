export const LOCALES = ["en", "pl", "ru", "uk"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const isLocale = (value: string): value is Locale =>
    LOCALES.some((locale) => locale === value);
