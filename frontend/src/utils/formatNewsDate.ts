// an ISO date parses as UTC midnight, so both formatters render in UTC - local rendering would shift the calendar day in negative-offset timezones
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

// e.g. "Jul 2, 2026" - news items in the What's new modal
export const formatNewsDate = (isoDate: string): string =>
    new Intl.DateTimeFormat("en-US", FULL_FORMAT).format(new Date(isoDate));

// e.g. "Jul 2" - news items on the dashboard's What's new card
export const formatNewsDateShort = (isoDate: string): string =>
    new Intl.DateTimeFormat("en-US", SHORT_FORMAT).format(new Date(isoDate));
