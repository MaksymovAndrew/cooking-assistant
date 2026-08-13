import { MS_PER_DAY } from "constants/time";
import type { ExpiryStatus } from "types/expiry";
import type { PantryLot } from "types/userIngredient";

const WARNING_THRESHOLD_DAYS = 4;

// purchase_date arrives as a UTC-midnight timestamp, so every getter here is UTC - local getters would shift the calendar day for some timezones
const startOfDayUTC = (date: Date): number =>
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

// shared by getExpiryStatus and any caller (e.g. the expired-ingredients notice) that needs the
// expiry date itself, not just a tone/days summary
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

// null when there's no usable expiry data; deliberately a different rule from isExpired() in ingredientExpirationUtils.ts (that one expires on the expiry day itself)
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

// lots are ordered oldest-first by the API, so lots[0] is the soonest-expiring (worst) one -
// a card shows this single status even though the ingredient may hold several lots
export const getWorstLotExpiryStatus = (
    daysToExpire: number | null | undefined,
    lots: PantryLot[],
): ExpiryStatus | null => getExpiryStatus(daysToExpire, lots[0]?.purchase_date);
