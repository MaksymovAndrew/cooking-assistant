import { dateLocaleFor, DEFAULT_LANGUAGE } from "constants/languages";

// pass the active i18n language (component code uses `i18n.language`); non-React callers fall back to the default

// short calendar date, e.g. "31/12/2024"
export const formatDate = (
    date: Date | string,
    language: string = DEFAULT_LANGUAGE,
): string => new Date(date).toLocaleDateString(dateLocaleFor(language));

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
};

export const formatDateTime = (
    date: Date | string,
    language: string = DEFAULT_LANGUAGE,
): string =>
    new Date(date).toLocaleString(dateLocaleFor(language), DATE_TIME_OPTIONS);
