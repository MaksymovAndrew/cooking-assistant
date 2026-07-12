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

// fixed en-US date style (cards/detail), independent of the app language - a DB date-only value parses as UTC midnight, so UTC keeps the calendar day stable regardless of the viewer's timezone
const SHORT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
};

const FULL_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
};

// e.g. "Mar 12" - card and list dates
export const formatShortDate = (date: Date | string): string =>
    new Intl.DateTimeFormat("en-US", SHORT_DATE_OPTIONS).format(new Date(date));

// e.g. "Mar 12, 2026" - detail-page dates
export const formatFullDate = (date: Date | string): string =>
    new Intl.DateTimeFormat("en-US", FULL_DATE_OPTIONS).format(new Date(date));

const JOINED_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
};

// e.g. "Jun 2025" - profile header "Joined ..." line
export const formatJoinedDate = (date: Date | string): string =>
    new Intl.DateTimeFormat("en-US", JOINED_DATE_OPTIONS).format(
        new Date(date),
    );
