import { render, screen } from "@testing-library/react";

import { StatStrip } from "components/home/StatStrip";

describe("StatStrip", () => {
    it("should render every stat card with its value and label", () => {
        render(
            <StatStrip
                recipesCount={4}
                menusCount={2}
                pantryCount={10}
                expiringCount={1}
            />,
        );

        expect(screen.getByText("4")).toBeInTheDocument();
        expect(screen.getAllByText("Recipes")).toHaveLength(2);
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getAllByText("Menus")).toHaveLength(2);
        expect(screen.getByText("10")).toBeInTheDocument();
        expect(screen.getByText("Pantry items")).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("Expiring soon")).toBeInTheDocument();
    });
});
