import { MS_PER_DAY } from "constants/time";
import type { ExpiryStatus } from "types/expiry";

const WARNING_THRESHOLD_DAYS = 4;

// purchase_date arrives as a UTC-midnight timestamp, so every getter here is
// UTC - local getters would shift the calendar day for some timezones
const startOfDayUTC = (date: Date): number =>
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

// null when there's no usable expiry data; deliberately a different rule from
// isExpired() in ingredientExpirationUtils.ts (that one expires on the expiry day itself)
export const getExpiryStatus = (
    daysToExpire: number | null | undefined,
    purchaseDate: string | undefined,
): ExpiryStatus | null => {
    if (typeof daysToExpire !== "number" || !purchaseDate) {
        return null;
    }

    const purchasedAt = new Date(purchaseDate);
    const expiresAt = new Date(
        Date.UTC(
            purchasedAt.getUTCFullYear(),
            purchasedAt.getUTCMonth(),
            purchasedAt.getUTCDate() + daysToExpire,
        ),
    );

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
