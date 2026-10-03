import { formatDate } from "utils/intlFormat";

// an ISO date parses as UTC midnight, so local rendering would shift the day in negative offsets
const FULL_FORMAT: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
};

const SHORT_FORMAT: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
};

export const formatNewsDate = (isoDate: string, locale: string): string =>
    formatDate(isoDate, locale, FULL_FORMAT);

export const formatNewsDateShort = (isoDate: string, locale: string): string =>
    formatDate(isoDate, locale, SHORT_FORMAT);
