import { formatNumber } from "utils/intlFormat";

const QUANTITY_DECIMALS = 2;

// scaled and summed amounts arrive as long fractions, so two decimals are enough to cook and shop by
export const roundQuantity = (quantity: number): number =>
    Number(quantity.toFixed(QUANTITY_DECIMALS));

// the page's own decimal separator: 0.5 in English, 0,5 in Polish, Russian and Ukrainian
export const formatQuantity = (quantity: number, locale: string): string =>
    formatNumber(roundQuantity(quantity), locale, {
        maximumFractionDigits: QUANTITY_DECIMALS,
    });
