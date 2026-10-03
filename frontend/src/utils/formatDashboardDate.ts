import { formatDate } from "utils/intlFormat";

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
};

export const formatDashboardDate = (date: Date, locale: string): string =>
    formatDate(date, locale, DATE_FORMAT_OPTIONS);
