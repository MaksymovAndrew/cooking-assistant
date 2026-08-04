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
    it("should start at local midnight and end right now", () => {
        const range = getTodayRange();

        expect(range.from).toBe(new Date(2026, 0, 14).toISOString());
        expect(range.to).toBe(NOW.toISOString());
    });

    it("should anchor on an explicit day key instead of the current day", () => {
        const range = getTodayRange(new Date(2026, 0, 10).toDateString());

        expect(range.from).toBe(new Date(2026, 0, 10).toISOString());
    });
});

describe("getLastNDaysRange", () => {
    it("should start 6 local days back for a 7-day window and end right now", () => {
        const range = getLastNDaysRange(7);

        expect(range.from).toBe(new Date(2026, 0, 8).toISOString());
        expect(range.to).toBe(NOW.toISOString());
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
