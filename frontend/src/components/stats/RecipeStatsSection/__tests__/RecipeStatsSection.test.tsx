import { render, screen } from "@testing-library/react";

import type { RecipeWithIngredientNames } from "types/recipe";
import type { RecipeStatistics } from "types/stats";

import { RecipeStatsSection } from "components/stats/RecipeStatsSection";

const RECIPE: RecipeWithIngredientNames = {
    id: 1,
    title: "Borscht",
    type_name: "Soup",
    creation_date: "2024-01-01",
    cooking_time: 30,
    ingredients: ["beet"],
};

const STATS: RecipeStatistics = {
    stats: [{ typeName: "Soup", count: 2 }],
    recipesCount: 2,
    averageCookingTimeOverall: 25,
    averageCookingTimesByType: [{ typeName: "Soup", averageCookingTime: 20 }],
    mostUsedType: { typeName: "Soup", count: 2 },
    fastestRecipes: [RECIPE],
    slowestRecipes: [RECIPE],
    mostIngredientsRecipes: [RECIPE],
    leastIngredientsRecipes: [RECIPE],
};

describe("RecipeStatsSection", () => {
    it("should render the quick-stat tiles", () => {
        render(<RecipeStatsSection stats={STATS} menusCount={5} />);

        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getByText("25 min")).toBeInTheDocument();
        expect(screen.getAllByText("Soup").length).toBeGreaterThan(0);
        expect(screen.getByText("2 of 2 recipes")).toBeInTheDocument();
    });

    it("should show a placeholder tile when there is no most-used type", () => {
        render(
            <RecipeStatsSection
                stats={{ ...STATS, mostUsedType: null, recipesCount: 0 }}
                menusCount={5}
            />,
        );

        expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("should render the recipe extremes", () => {
        render(<RecipeStatsSection stats={STATS} menusCount={5} />);

        expect(screen.getAllByText("Borscht").length).toBeGreaterThan(0);
    });

    it("should color each average-time bar to match its type's donut-chart color", () => {
        render(
            <RecipeStatsSection
                stats={{
                    ...STATS,
                    stats: [
                        { typeName: "Soup", count: 2 },
                        { typeName: "Dessert", count: 1 },
                    ],
                    averageCookingTimesByType: [
                        // deliberately reversed order vs. `stats` above
                        { typeName: "Dessert", averageCookingTime: 15 },
                        { typeName: "Soup", averageCookingTime: 20 },
                    ],
                }}
                menusCount={5}
            />,
        );

        const fills = screen.getAllByTestId("stat-bar-fill");

        expect(fills[0]).toHaveStyle({ backgroundColor: "#4FA3D9" }); // Dessert - index 1 in `stats`
        expect(fills[1]).toHaveStyle({ backgroundColor: "#7E60BF" }); // Soup - index 0 in `stats`
    });
});
