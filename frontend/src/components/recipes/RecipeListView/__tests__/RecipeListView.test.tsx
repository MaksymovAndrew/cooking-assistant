import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PAGE_SIZE } from "constants/pagination";
import type { RecipeSearchResultItem } from "types/recipe";

import { RecipeListView } from "components/recipes/RecipeListView";

import type { RecipeFilterState } from "utils/filters/recipeFilterDefs";

import { renderWithRouter } from "test/router";

const RECIPE_TITLE = "Borscht";
const MINE_CLASS = "content-card--mine";
const CALORIES_OVER_BUDGET = 700;
const CALORIES_OVER_BUDGET_LABEL = `${CALORIES_OVER_BUDGET} kcal`;

const RECIPES: RecipeSearchResultItem[] = [
    {
        id: 1,
        title: RECIPE_TITLE,
        type_name: "Soup",
        creation_date: "2024-01-01",
        cooking_time: 60,
        ingredients: [],
        calories_per_portion: null,
        isOwner: false,
    },
];

const FILTERS: RecipeFilterState = {
    search: "",
    types: [],
    ingredients: [],
    cookingTime: { min: "", max: "" },
    calories: { min: "", max: "" },
    sort: null,
    inPantry: false,
};

const baseProps = {
    filters: FILTERS,
    setValue: jest.fn(),
    setValues: jest.fn(),
    resetFilters: jest.fn(),
    activeCount: 0,
    activeFilters: [],
    calorieGoal: null,
    calorieRemaining: null,
    isPantryEmpty: false,
    types: [],
    ingredients: [],
    descriptions: [],
    heading: "All recipes",
    subtitle: "Browse your cookbook",
    emptyTitle: "No recipes yet",
    emptyDescription: "Your cookbook is empty.",
    hasActiveFilters: false,
    searchPlaceholder: "ingredient name",
    onRetry: jest.fn(),
    total: RECIPES.length,
    loadedCount: RECIPES.length,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: jest.fn(),
    loadMoreError: null,
};

describe("RecipeListView", () => {
    it("should render the heading, subtitle and a card per recipe", () => {
        renderWithRouter(
            <RecipeListView
                {...baseProps}
                recipes={RECIPES}
                noRecipes={false}
                error={null}
            />,
        );

        expect(screen.getByText("All recipes")).toBeInTheDocument();
        expect(screen.getByText("Browse your cookbook")).toBeInTheDocument();
        expect(screen.getByText(RECIPE_TITLE)).toBeInTheDocument();
    });

    it("should recolor a card whose calories exceed what's left today", () => {
        const pricierRecipe = {
            ...RECIPES[0],
            calories_per_portion: CALORIES_OVER_BUDGET,
        };

        renderWithRouter(
            <RecipeListView
                {...baseProps}
                recipes={[pricierRecipe]}
                noRecipes={false}
                error={null}
                calorieGoal={2000}
                calorieRemaining={500}
            />,
        );

        expect(screen.getByText(CALORIES_OVER_BUDGET_LABEL)).toHaveClass(
            "content-card__meta-item--calorie-over",
        );
    });

    it("should not recolor a card when there is no calorie goal", () => {
        const pricierRecipe = {
            ...RECIPES[0],
            calories_per_portion: CALORIES_OVER_BUDGET,
        };

        renderWithRouter(
            <RecipeListView
                {...baseProps}
                recipes={[pricierRecipe]}
                noRecipes={false}
                error={null}
            />,
        );

        expect(screen.getByText(CALORIES_OVER_BUDGET_LABEL)).not.toHaveClass(
            "content-card__meta-item--calorie-over",
        );
    });

    it("should render the translated New recipe button, not a raw i18n key", () => {
        renderWithRouter(
            <RecipeListView
                {...baseProps}
                recipes={RECIPES}
                noRecipes={false}
                error={null}
            />,
        );

        expect(
            screen.getByRole("link", { name: "New recipe" }),
        ).toBeInTheDocument();
    });

    it("should render the truly-empty title, description and create-first action when there are no active filters", () => {
        renderWithRouter(
            <RecipeListView
                {...baseProps}
                recipes={[]}
                noRecipes={true}
                error={null}
            />,
        );

        expect(screen.getByText("No recipes yet")).toBeInTheDocument();
        expect(screen.getByText("Your cookbook is empty.")).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /Create your first recipe!/ }),
        ).toBeInTheDocument();
        expect(screen.queryByText(RECIPE_TITLE)).not.toBeInTheDocument();
    });

    it("should render the no-matches state and a working Clear filters button when filters are active", async () => {
        const resetFilters = jest.fn();

        renderWithRouter(
            <RecipeListView
                {...baseProps}
                recipes={[]}
                noRecipes={true}
                error={null}
                hasActiveFilters={true}
                filters={{ ...FILTERS, search: "cauliflower" }}
                resetFilters={resetFilters}
            />,
        );

        expect(
            screen.getByText("No recipes match your search"),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                "Nothing matches “cauliflower” with your current filters. Try a different ingredient, clear the filters, or create a brand-new recipe.",
            ),
        ).toBeInTheDocument();

        await userEvent.click(
            screen.getByRole("button", { name: "Clear filters" }),
        );

        expect(resetFilters).toHaveBeenCalledTimes(1);
    });

    it("should not let a pending, uncommitted search re-apply itself after Clear all is clicked", async () => {
        jest.useFakeTimers();
        const user = userEvent.setup({
            advanceTimers: (ms) => {
                jest.advanceTimersByTime(ms);
            },
        });
        const setValue = jest.fn();
        const resetFilters = jest.fn();

        try {
            renderWithRouter(
                <RecipeListView
                    {...baseProps}
                    recipes={RECIPES}
                    noRecipes={false}
                    error={null}
                    hasActiveFilters={true}
                    setValue={setValue}
                    resetFilters={resetFilters}
                />,
            );

            await user.type(
                screen.getByPlaceholderText(/ingredient name/i),
                "chick",
            );
            // debounce still pending - nothing committed yet
            expect(setValue).not.toHaveBeenCalled();

            await user.click(screen.getByRole("button", { name: "Clear all" }));
            expect(resetFilters).toHaveBeenCalledTimes(1);

            act(() => {
                jest.advanceTimersByTime(300);
            });

            expect(setValue).not.toHaveBeenCalled();
        } finally {
            jest.useRealTimers();
        }
    });

    it("should render the error state and call onRetry when Try again is clicked", async () => {
        const onRetry = jest.fn();

        renderWithRouter(
            <RecipeListView
                {...baseProps}
                recipes={[]}
                noRecipes={false}
                error="Boom"
                onRetry={onRetry}
            />,
        );

        expect(screen.getByText("Boom")).toBeInTheDocument();

        await userEvent.click(
            screen.getByRole("button", { name: "Try again" }),
        );

        expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("should show the load more button and counter once total exceeds a page", () => {
        renderWithRouter(
            <RecipeListView
                {...baseProps}
                recipes={RECIPES}
                noRecipes={false}
                error={null}
                total={PAGE_SIZE + 1}
                hasNextPage={true}
            />,
        );

        expect(
            screen.getByText(`Showing ${RECIPES.length} of ${PAGE_SIZE + 1}`),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Load more" }),
        ).toBeInTheDocument();
    });

    it("should call fetchNextPage when the load more button is clicked", async () => {
        const fetchNextPage = jest.fn();

        renderWithRouter(
            <RecipeListView
                {...baseProps}
                recipes={RECIPES}
                noRecipes={false}
                error={null}
                hasNextPage={true}
                fetchNextPage={fetchNextPage}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Load more" }),
        );

        expect(fetchNextPage).toHaveBeenCalledTimes(1);
    });

    it("should render the load more error while keeping previously loaded recipes", () => {
        renderWithRouter(
            <RecipeListView
                {...baseProps}
                recipes={RECIPES}
                noRecipes={false}
                error={null}
                hasNextPage={true}
                loadMoreError="Couldn't load more"
            />,
        );

        expect(screen.getByText(RECIPE_TITLE)).toBeInTheDocument();
        expect(screen.getByText("Couldn't load more")).toBeInTheDocument();
    });

    it("should mark cards as mine when the mine prop is set", () => {
        renderWithRouter(
            <RecipeListView
                {...baseProps}
                recipes={RECIPES}
                noRecipes={false}
                error={null}
                mine
            />,
        );

        expect(screen.getByRole("link", { name: /Borscht/ })).toHaveClass(
            MINE_CLASS,
        );
    });

    it("should mark a card as mine when the server flags it as owned, even without the mine prop", () => {
        renderWithRouter(
            <RecipeListView
                {...baseProps}
                recipes={[{ ...RECIPES[0], isOwner: true }]}
                noRecipes={false}
                error={null}
            />,
        );

        expect(screen.getByRole("link", { name: /Borscht/ })).toHaveClass(
            MINE_CLASS,
        );
    });

    it("should not mark another user's card as mine", () => {
        renderWithRouter(
            <RecipeListView
                {...baseProps}
                recipes={[{ ...RECIPES[0], isOwner: false }]}
                noRecipes={false}
                error={null}
            />,
        );

        expect(screen.getByRole("link", { name: /Borscht/ })).not.toHaveClass(
            MINE_CLASS,
        );
    });

    it("should show the pantry banner with the result count when the pantry filter is active", () => {
        renderWithRouter(
            <RecipeListView
                {...baseProps}
                recipes={RECIPES}
                noRecipes={false}
                error={null}
                filters={{ ...FILTERS, inPantry: true }}
                total={1}
            />,
        );

        expect(
            screen.getByText(
                "Showing only recipes you can make right now — 1 recipe",
            ),
        ).toBeInTheDocument();
    });

    it("should show the pantry-empty state with a link to the pantry when the pantry is empty", () => {
        renderWithRouter(
            <RecipeListView
                {...baseProps}
                recipes={[]}
                noRecipes={true}
                error={null}
                filters={{ ...FILTERS, inPantry: true }}
                isPantryEmpty={true}
            />,
        );

        expect(screen.getByText("Your pantry is empty")).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Go to pantry" }),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(
                "Showing only recipes you can make right now — 1 recipe",
            ),
        ).not.toBeInTheDocument();
    });
});
