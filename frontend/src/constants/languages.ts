// ru/uk locale mappings are pre-wired ahead of their translation files landing
export const LANGUAGES = {
    en: "en",
    ru: "ru",
    uk: "uk",
} as const;

export type AppLanguage = (typeof LANGUAGES)[keyof typeof LANGUAGES];

export const DEFAULT_LANGUAGE: AppLanguage = LANGUAGES.en;

// languages with shipped translations; extend as ru/uk land
export const SUPPORTED_LANGUAGES: AppLanguage[] = [LANGUAGES.en];

const DATE_LOCALE_BY_LANGUAGE: Record<string, string> = {
    [LANGUAGES.en]: "en-GB",
    [LANGUAGES.ru]: "ru-RU",
    [LANGUAGES.uk]: "uk-UA",
};

export const DEFAULT_DATE_LOCALE = DATE_LOCALE_BY_LANGUAGE[DEFAULT_LANGUAGE];

export const dateLocaleFor = (language: string): string =>
    DATE_LOCALE_BY_LANGUAGE[language] ?? DEFAULT_DATE_LOCALE;
