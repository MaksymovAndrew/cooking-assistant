import { formatDashboardDate } from "utils/formatDashboardDate";

describe("formatDashboardDate", () => {
    it("should format the date as a short weekday, month, day and year", () => {
        const result = formatDashboardDate(new Date("2026-06-30T12:00:00Z"));

        expect(result).toContain("2026");
        expect(result).toContain("Jun");
        expect(result).toContain("30");
    });
});
