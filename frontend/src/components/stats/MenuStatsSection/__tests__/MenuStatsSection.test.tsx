import { render, screen } from "@testing-library/react";

import type { MenuStatistics } from "types/stats";

import { MenuStatsSection } from "components/stats/MenuStatsSection";

const STATS: MenuStatistics = {
    menusCount: 3,
    menuCountByCategory: [{ categoryname: "Lunch", menuCount: 2 }],
    mostUsedCategory: { categoryname: "Lunch", menuCount: 2 },
};

describe("MenuStatsSection", () => {
    it("should render the quick-stat tiles", () => {
        render(<MenuStatsSection stats={STATS} />);

        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getAllByText("Lunch").length).toBeGreaterThan(0);
        expect(screen.getByText("2 of 3 menus")).toBeInTheDocument();
    });

    it("should show a placeholder tile when there is no most-used category", () => {
        render(
            <MenuStatsSection
                stats={{ ...STATS, mostUsedCategory: null, menusCount: 0 }}
            />,
        );

        expect(screen.getByText("—")).toBeInTheDocument();
    });
});
