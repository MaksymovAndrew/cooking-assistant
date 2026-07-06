import { render, screen } from "@testing-library/react";

import { StatCard } from "components/stats/StatCard";

describe("StatCard", () => {
    it("should render its children", () => {
        render(
            <StatCard>
                <p>Card content</p>
            </StatCard>,
        );

        expect(screen.getByText("Card content")).toBeInTheDocument();
    });
});
