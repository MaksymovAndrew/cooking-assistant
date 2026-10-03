import type { TFunction } from "i18next";

import { formatDate } from "utils/intlFormat";

// a DB date parses as UTC midnight, so UTC keeps the calendar day in every timezone
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

export const formatShortDate = (date: Date | string, locale: string): string =>
    formatDate(date, locale, SHORT_DATE_OPTIONS);

export const formatFullDate = (date: Date | string, locale: string): string =>
    formatDate(date, locale, FULL_DATE_OPTIONS);

const JOINED_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
};

export const formatJoinedDate = (date: Date | string, locale: string): string =>
    formatDate(date, locale, JOINED_DATE_OPTIONS);

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

// one translated string, never words in separate elements, which a flex gap spaces unevenly
export const formatRelativeTime = (
    t: TFunction,
    date: Date | string,
): string => {
    const elapsedSeconds = Math.max(
        0,
        (Date.now() - new Date(date).getTime()) / MS_PER_SECOND,
    );
    const minutes = Math.floor(elapsedSeconds / SECONDS_PER_MINUTE);

    if (minutes < 1) {
        return t("timeAgo.justNow");
    }

    const hours = Math.floor(minutes / MINUTES_PER_HOUR);

    if (hours < 1) {
        return t("timeAgo.minutes", { count: minutes });
    }

    const days = Math.floor(hours / HOURS_PER_DAY);

    if (days < 1) {
        return t("timeAgo.hours", { count: hours });
    }

    return t("timeAgo.days", { count: days });
};
