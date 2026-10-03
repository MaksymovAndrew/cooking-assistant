import { formatDashboardDate } from "utils/formatDashboardDate";

describe("formatDashboardDate", () => {
    it("should name the viewer's own day with its weekday, in the page's language", () => {
        // just past local midnight, when the UTC day is still the previous one east of Greenwich
        const justPastMidnight = new Date(2026, 5, 30, 0, 5);

        expect(formatDashboardDate(justPastMidnight, "en")).toBe(
            "Tue, Jun 30, 2026",
        );
        expect(formatDashboardDate(justPastMidnight, "pl")).toBe(
            "wt., 30 cze 2026",
        );
    });
});
