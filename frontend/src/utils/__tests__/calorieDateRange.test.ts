import { getLastNDaysRange, getTodayRange } from "utils/calorieDateRange";

const NOW = new Date(2026, 0, 14, 15, 30);

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
});

afterEach(() => {
    jest.useRealTimers();
});

describe("getTodayRange", () => {
    it("should span today from local midnight to the next one", () => {
        const range = getTodayRange();

        expect(range.from).toBe(new Date(2026, 0, 14).toISOString());
        expect(range.to).toBe(new Date(2026, 0, 15).toISOString());
    });

    it("should anchor on an explicit day key instead of the current day", () => {
        const range = getTodayRange(new Date(2026, 0, 10).toDateString());

        expect(range.from).toBe(new Date(2026, 0, 10).toISOString());
        expect(range.to).toBe(new Date(2026, 0, 11).toISOString());
    });

    it("should still cover an entry logged minutes after the range was built", () => {
        const range = getTodayRange();
        const loggedLater = new Date(2026, 0, 14, 23, 59).toISOString();

        expect(loggedLater < range.to).toBe(true);
    });

    it("should return an identical range across a minute boundary, so callers share one RTK Query cache entry", () => {
        jest.setSystemTime(new Date(2026, 0, 14, 15, 30, 59));
        const first = getTodayRange();

        jest.setSystemTime(new Date(2026, 0, 14, 15, 31, 1));
        const second = getTodayRange();

        expect(second).toEqual(first);
    });
});

describe("getLastNDaysRange", () => {
    it("should start 6 local days back for a 7-day window and end at the next midnight", () => {
        const range = getLastNDaysRange(7);

        expect(range.from).toBe(new Date(2026, 0, 8).toISOString());
        expect(range.to).toBe(new Date(2026, 0, 15).toISOString());
    });

    it("should start today for a 1-day window", () => {
        const range = getLastNDaysRange(1);

        expect(range.from).toBe(new Date(2026, 0, 14).toISOString());
    });

    it("should anchor on an explicit day key instead of the current day", () => {
        const range = getLastNDaysRange(
            7,
            new Date(2026, 0, 20).toDateString(),
        );

        expect(range.from).toBe(new Date(2026, 0, 14).toISOString());
    });
});
