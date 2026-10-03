import { MS_PER_DAY } from "constants/time";
import type { ExpiryStatus } from "types/expiry";
import type { PantryLot } from "types/userIngredient";

const WARNING_THRESHOLD_DAYS = 4;

// purchase_date is a UTC-midnight timestamp: local getters would shift the day in some timezones
const startOfDayUTC = (date: Date): number =>
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

export const computeExpiryDate = (
    purchaseDate: string,
    daysToExpire: number,
): Date => {
    const purchasedAt = new Date(purchaseDate);

    return new Date(
        Date.UTC(
            purchasedAt.getUTCFullYear(),
            purchasedAt.getUTCMonth(),
            purchasedAt.getUTCDate() + daysToExpire,
        ),
    );
};

// the expiry day itself still counts as usable
export const getExpiryStatus = (
    daysToExpire: number | null | undefined,
    purchaseDate: string | undefined,
): ExpiryStatus | null => {
    if (typeof daysToExpire !== "number" || !purchaseDate) {
        return null;
    }

    const expiresAt = computeExpiryDate(purchaseDate, daysToExpire);

    const days = Math.round(
        (startOfDayUTC(expiresAt) - startOfDayUTC(new Date())) / MS_PER_DAY,
    );

    if (days < 0) {
        return { tone: "expired", days };
    }

    if (days <= WARNING_THRESHOLD_DAYS) {
        return { tone: "warning", days };
    }

    return { tone: "ok", days };
};

// the API orders lots oldest-first, so lots[0] expires soonest
export const getWorstLotExpiryStatus = (
    daysToExpire: number | null | undefined,
    lots: PantryLot[],
): ExpiryStatus | null => getExpiryStatus(daysToExpire, lots[0]?.purchase_date);

export const isLotExpired = (
    daysToExpire: number | null,
    purchaseDate: string | undefined,
): boolean => getExpiryStatus(daysToExpire, purchaseDate)?.tone === "expired";
