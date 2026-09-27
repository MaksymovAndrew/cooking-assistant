import { formatNumber } from "utils/intlFormat";

const RATING_DECIMALS = 1;

// one decimal everywhere a rating is printed, so 4 reads "4.0" beside a "4.5" (4,0 and 4,5 where a comma is the separator)
export const formatRatingAverage = (average: number, locale: string): string =>
    formatNumber(average, locale, {
        minimumFractionDigits: RATING_DECIMALS,
        maximumFractionDigits: RATING_DECIMALS,
    });
