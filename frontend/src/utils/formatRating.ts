import { formatNumber } from "utils/intlFormat";

const RATING_DECIMALS = 1;

// always one decimal, so 4 reads "4.0" beside a "4.5"
export const formatRatingAverage = (average: number, locale: string): string =>
    formatNumber(average, locale, {
        minimumFractionDigits: RATING_DECIMALS,
        maximumFractionDigits: RATING_DECIMALS,
    });
