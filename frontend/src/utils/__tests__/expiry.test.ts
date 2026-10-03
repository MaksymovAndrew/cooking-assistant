import {
    computeExpiryDate,
    getExpiryStatus,
    getWorstLotExpiryStatus,
    isLotExpired,
} from "utils/expiry";

const NOW = new Date("2026-07-10T12:00:00.000Z").getTime();
const TODAY = "2026-07-10T00:00:00.000Z";
const LONG_AGO = "2026-06-10T00:00:00.000Z";
const DAYS_TO_EXPIRE = 10;

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
});

afterEach(() => {
    jest.useRealTimers();
});

describe("getExpiryStatus", () => {
    it("should return null when daysToExpire is not a number", () => {
        expect(getExpiryStatus(null, TODAY)).toBeNull();
        expect(getExpiryStatus(undefined, TODAY)).toBeNull();
    });

    it("should return null when there is no purchase date", () => {
        expect(getExpiryStatus(DAYS_TO_EXPIRE, undefined)).toBeNull();
    });

    it("should mark the ingredient as expired when the expiry date is in the past", () => {
        expect(getExpiryStatus(DAYS_TO_EXPIRE, LONG_AGO)).toEqual({
            tone: "expired",
            days: -20,
        });
    });

    it("should mark the ingredient as warning when it expires within the threshold", () => {
        expect(
            getExpiryStatus(DAYS_TO_EXPIRE, "2026-07-04T00:00:00.000Z"),
        ).toEqual({ tone: "warning", days: 4 });
    });

    it("should mark the ingredient as ok once its expiry is past the threshold", () => {
        expect(
            getExpiryStatus(DAYS_TO_EXPIRE, "2026-07-05T00:00:00.000Z"),
        ).toEqual({ tone: "ok", days: 5 });
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
            { id: 102, quantity: 1, purchase_date: LONG_AGO },
            { id: 101, quantity: 1, purchase_date: TODAY },
        ]);

        expect(status).toEqual({ tone: "expired", days: -20 });
    });
});

describe("isLotExpired", () => {
    it("should expire a lot once its expiry day has passed", () => {
        expect(isLotExpired(DAYS_TO_EXPIRE, "2026-06-29T00:00:00.000Z")).toBe(
            true,
        );
    });

    it("should keep a lot on its expiry day itself", () => {
        expect(isLotExpired(DAYS_TO_EXPIRE, "2026-06-30T00:00:00.000Z")).toBe(
            false,
        );
    });

    it("should keep a lot that has not expired yet", () => {
        expect(isLotExpired(DAYS_TO_EXPIRE, "2026-07-09T00:00:00.000Z")).toBe(
            false,
        );
    });

    it("should not expire a lot without expiry data", () => {
        expect(isLotExpired(null, LONG_AGO)).toBe(false);
        expect(isLotExpired(DAYS_TO_EXPIRE, undefined)).toBe(false);
    });
});
