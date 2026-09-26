import { formatDate } from "utils/intlFormat";

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
};

// e.g. "Mon, Jun 30, 2026" - the greeting header's date line
export const formatDashboardDate = (date: Date, locale: string): string =>
    formatDate(date, locale, DATE_FORMAT_OPTIONS);
