import { screen } from "@testing-library/react";

import { StatStrip } from "components/home/StatStrip";

import { renderWithRouter } from "test/router";

describe("StatStrip", () => {
    it("should render every stat card with its value and label", () => {
        renderWithRouter(
            <StatStrip
                recipesCount={4}
                menusCount={2}
                pantryCount={10}
                expiringCount={1}
                kcalToday={500}
                kcalGoal={2000}
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
        expect(screen.getByText("500")).toBeInTheDocument();
        expect(screen.getByText("Kcal today")).toBeInTheDocument();
        expect(screen.getByText("1,500")).toBeInTheDocument();
        expect(screen.getByText("Kcal left")).toBeInTheDocument();
    });

    it("should render only one calorie tile (the set-a-goal prompt) when no goal is set", () => {
        renderWithRouter(
            <StatStrip
                recipesCount={4}
                menusCount={2}
                pantryCount={10}
                expiringCount={1}
                kcalToday={500}
                kcalGoal={null}
            />,
        );

        expect(screen.getAllByText("Set a goal")).toHaveLength(1);
        expect(screen.queryByText("Kcal left")).not.toBeInTheDocument();
    });
});
