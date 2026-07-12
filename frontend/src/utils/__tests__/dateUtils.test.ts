import { formatDate, formatDateTime, formatJoinedDate } from "utils/dateUtils";

describe("formatDate", () => {
    it("should format a date string as a short en-GB date by default", () => {
        expect(formatDate("2024-12-31")).toBe("31/12/2024");
    });

    it("should accept a Date instance", () => {
        expect(formatDate(new Date("2024-01-05"))).toBe("05/01/2024");
    });

    it("should fall back to the default locale for an unknown language", () => {
        expect(formatDate("2024-12-31", "xx")).toBe("31/12/2024");
    });
});

describe("formatDateTime", () => {
    it("should include the long month and time", () => {
        const result = formatDateTime("2024-12-31T09:05:00");

        expect(result).toContain("December");
        expect(result).toContain("2024");
    });
});

describe("formatJoinedDate", () => {
    it("should format a date as short month and year", () => {
        expect(formatJoinedDate("2025-06-15")).toBe("Jun 2025");
    });
});
