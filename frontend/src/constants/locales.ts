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

// each language named in itself, so a visitor who can't read the current one still finds their own
export const LOCALE_NAMES: Record<Locale, string> = {
    en: "English",
    pl: "Polski",
    ru: "Русский",
    uk: "Українська",
};

// the short mark on a switcher or a badge; Ukrainian reads as the country code people know
export const LOCALE_BADGES: Record<Locale, string> = {
    en: "EN",
    pl: "PL",
    ru: "RU",
    uk: "UA",
};

const LANGUAGE_WORDS: Record<Locale, string> = {
    en: "Language",
    pl: "Język",
    ru: "Язык",
    uk: "Мова",
};

// the registration field is labelled in every language at once, whichever one the page is in
export const LANGUAGE_FIELD_LABEL = LOCALES.map(
    (locale) => LANGUAGE_WORDS[locale],
).join(" · ");
