// the languages the app is served in; the first is the default and the only one without a URL prefix
export const LOCALES = ["en", "pl", "ru", "uk"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

// remembers a language the visitor chose, so an unprefixed link still opens in it
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export const OPEN_GRAPH_LOCALES: Record<Locale, string> = {
    en: "en_US",
    pl: "pl_PL",
    ru: "ru_RU",
    uk: "uk_UA",
};

export const isLocale = (value: string): value is Locale =>
    LOCALES.some((locale) => locale === value);

export const toLocale = (value: string): Locale =>
    isLocale(value) ? value : DEFAULT_LOCALE;
