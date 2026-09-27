import i18next from "i18next";

import { formatJoinedDate, formatRelativeTime } from "utils/dateUtils";

const t = i18next.getFixedT("en");
const LOCALE = "en";

describe("formatJoinedDate", () => {
    it("should format a date as short month and year", () => {
        expect(formatJoinedDate("2025-06-15", LOCALE)).toBe("Jun 2025");
    });
});

describe("formatRelativeTime", () => {
    const NOW = new Date(2026, 0, 14, 12, 0, 0);

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(NOW);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should report just now for under a minute", () => {
        const thirtySecondsAgo = new Date(NOW.getTime() - 30 * 1000);

        expect(formatRelativeTime(t, thirtySecondsAgo)).toBe("Just now");
    });

    it("should report minutes as one word close to the unit", () => {
        const fiveMinutesAgo = new Date(NOW.getTime() - 5 * 60 * 1000);

        expect(formatRelativeTime(t, fiveMinutesAgo)).toBe("5 min ago");
    });

    it("should report hours", () => {
        const sevenHoursAgo = new Date(NOW.getTime() - 7 * 60 * 60 * 1000);

        expect(formatRelativeTime(t, sevenHoursAgo)).toBe("7 h ago");
    });

    it("should report days once past 24 hours", () => {
        const twoDaysAgo = new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000);

        expect(formatRelativeTime(t, twoDaysAgo)).toBe("2 d ago");
    });
});
