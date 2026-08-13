import {
    computeExpiryDate,
    getExpiryStatus,
    getWorstLotExpiryStatus,
} from "utils/expiry";

const DAYS_TO_EXPIRE = 10;

// local YYYY-MM-DD string for "n days ago" - avoids UTC round-trip drift near midnight
const purchasedDaysAgo = (days: number): string => {
    const date = new Date();

    date.setDate(date.getDate() - days);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

describe("getExpiryStatus", () => {
    it("should return null when daysToExpire is not a number", () => {
        expect(getExpiryStatus(null, purchasedDaysAgo(0))).toBeNull();
        expect(getExpiryStatus(undefined, purchasedDaysAgo(0))).toBeNull();
    });

    it("should return null when there is no purchase date", () => {
        expect(getExpiryStatus(DAYS_TO_EXPIRE, undefined)).toBeNull();
    });

    it("should mark the ingredient as expired when the expiry date is in the past", () => {
        const status = getExpiryStatus(DAYS_TO_EXPIRE, purchasedDaysAgo(30));

        expect(status).toEqual(expect.objectContaining({ tone: "expired" }));
        expect(status?.days).toBeLessThan(0);
    });

    it("should mark the ingredient as warning when it expires within the threshold", () => {
        const status = getExpiryStatus(DAYS_TO_EXPIRE, purchasedDaysAgo(8));

        expect(status).toEqual(expect.objectContaining({ tone: "warning" }));
    });

    it("should mark the ingredient as ok when it expires well in the future", () => {
        const status = getExpiryStatus(DAYS_TO_EXPIRE, purchasedDaysAgo(0));

        expect(status).toEqual(expect.objectContaining({ tone: "ok" }));
    });
});

describe("computeExpiryDate", () => {
    it("should add daysToExpire to the purchase date in UTC", () => {
        const expiresAt = computeExpiryDate("2026-01-01T00:00:00.000Z", 5);

        expect(expiresAt.toISOString()).toBe("2026-01-06T00:00:00.000Z");
    });
});

describe("getWorstLotExpiryStatus", () => {
    it("should return null when there are no lots", () => {
        expect(getWorstLotExpiryStatus(DAYS_TO_EXPIRE, [])).toBeNull();
    });

    it("should use the oldest lot (lots[0]) as the worst case, ignoring a fresher lot bought since", () => {
        const status = getWorstLotExpiryStatus(DAYS_TO_EXPIRE, [
            { quantity: 1, purchase_date: purchasedDaysAgo(30) },
            { quantity: 1, purchase_date: purchasedDaysAgo(0) },
        ]);

        expect(status).toEqual(expect.objectContaining({ tone: "expired" }));
    });
});
