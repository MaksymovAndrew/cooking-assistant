import { getExpiryStatus } from "utils/expiry";

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
