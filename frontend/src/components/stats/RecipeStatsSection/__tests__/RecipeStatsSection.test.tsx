import { screen } from "@testing-library/react";

import { recipeDetailsPath } from "constants/routes";
import type {
    RecipeCalorieEntry,
    RecipeIngredientCountEntry,
    RecipeStatistics,
    RecipeTimeEntry,
} from "types/stats";

import { RecipeStatsSection } from "components/stats/RecipeStatsSection";

import { renderWithRouter } from "test/router";

const RECIPE_ID = 1;
const TIME_ENTRY: RecipeTimeEntry = {
    id: RECIPE_ID,
    title: "Borscht",
    cookingTime: 30,
};
const INGREDIENT_ENTRY: RecipeIngredientCountEntry = {
    id: RECIPE_ID,
    title: "Borscht",
    ingredientCount: 3,
};
const CALORIE_ENTRY: RecipeCalorieEntry = {
    id: RECIPE_ID,
    title: "Borscht",
    caloriesPerPortion: 450,
};

const STATS: RecipeStatistics = {
    stats: [{ typeName: "Soup", count: 2 }],
    recipesCount: 2,
    averageCookingTimeOverall: 25,
    averageCookingTimesByType: [{ typeName: "Soup", averageCookingTime: 20 }],
    mostUsedType: { typeName: "Soup", count: 2 },
    fastestRecipes: [TIME_ENTRY],
    slowestRecipes: [TIME_ENTRY],
    mostIngredientsRecipes: [INGREDIENT_ENTRY],
    leastIngredientsRecipes: [INGREDIENT_ENTRY],
    averageCaloriesOverall: 450,
    mostCaloricRecipes: [CALORIE_ENTRY],
    leastCaloricRecipes: [CALORIE_ENTRY],
};

describe("RecipeStatsSection", () => {
    it("should render the quick-stat tiles", () => {
        renderWithRouter(<RecipeStatsSection stats={STATS} menusCount={5} />);

        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getByText("25 min")).toBeInTheDocument();
        expect(screen.getAllByText("Soup").length).toBeGreaterThan(0);
        expect(screen.getByText("2 of 2 recipes")).toBeInTheDocument();
        expect(screen.getAllByText("450 kcal").length).toBeGreaterThan(0);
    });

    it("should show a placeholder tile when there is no most-used type", () => {
        renderWithRouter(
            <RecipeStatsSection
                stats={{ ...STATS, mostUsedType: null, recipesCount: 0 }}
                menusCount={5}
            />,
        );

        expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("should show a placeholder tile when there is no calorie data", () => {
        renderWithRouter(
            <RecipeStatsSection
                stats={{
                    ...STATS,
                    averageCaloriesOverall: null,
                    mostCaloricRecipes: [],
                    leastCaloricRecipes: [],
                }}
                menusCount={5}
            />,
        );

        expect(screen.getByText("Avg calories")).toBeInTheDocument();
    });

    it("should render the recipe extremes", () => {
        renderWithRouter(<RecipeStatsSection stats={STATS} menusCount={5} />);

        expect(screen.getAllByText("Borscht").length).toBeGreaterThan(0);
    });

    it("should link each extreme recipe to its own detail page", () => {
        renderWithRouter(<RecipeStatsSection stats={STATS} menusCount={5} />);

        const links = screen.getAllByRole("link", { name: /Borscht/ });

        expect(links.length).toBeGreaterThan(0);
        links.forEach((link) => {
            expect(link).toHaveAttribute("href", recipeDetailsPath(RECIPE_ID));
        });
    });

    it("should abbreviate large calorie totals in the extremes list", () => {
        renderWithRouter(
            <RecipeStatsSection
                stats={{
                    ...STATS,
                    mostCaloricRecipes: [
                        { ...CALORIE_ENTRY, caloriesPerPortion: 13_333 },
                    ],
                    leastCaloricRecipes: [
                        { ...CALORIE_ENTRY, caloriesPerPortion: 13_333 },
                    ],
                }}
                menusCount={5}
            />,
        );

        expect(screen.getAllByText("13k kcal").length).toBeGreaterThan(0);
    });

    it("should color each average-time bar to match its type's donut-chart color", () => {
        renderWithRouter(
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
