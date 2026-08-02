import i18next from "i18next";

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

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

// a single translated string ("7 h ago"), never split across separate elements - a shared gap/flex
// wrapper around individually-rendered words is what produces uneven spacing between them
export const formatRelativeTime = (date: Date | string): string => {
    const elapsedSeconds = Math.max(
        0,
        (Date.now() - new Date(date).getTime()) / MS_PER_SECOND,
    );
    const minutes = Math.floor(elapsedSeconds / SECONDS_PER_MINUTE);

    if (minutes < 1) {
        return i18next.t("timeAgo.justNow");
    }

    const hours = Math.floor(minutes / MINUTES_PER_HOUR);

    if (hours < 1) {
        return i18next.t("timeAgo.minutes", { count: minutes });
    }

    const days = Math.floor(hours / HOURS_PER_DAY);

    if (days < 1) {
        return i18next.t("timeAgo.hours", { count: hours });
    }

    return i18next.t("timeAgo.days", { count: days });
};
