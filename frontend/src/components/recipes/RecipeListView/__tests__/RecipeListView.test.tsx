import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PAGE_SIZE } from "constants/pagination";
import type { RecipeListItem } from "types/recipe";

import type { RecipeFilterState } from "hooks/useRecipeListView";

import { RecipeListView } from "components/recipes/RecipeListView";

import { renderWithRouter } from "test/router";

const RECIPE_TITLE = "Borscht";
const MINE_CLASS = "content-card--mine";

const RECIPES: RecipeListItem[] = [
    {
        id: 1,
        title: RECIPE_TITLE,
        type_name: "Soup",
        creation_date: "2024-01-01",
        cooking_time: 60,
    },
];

const FILTERS: RecipeFilterState = {
    selectedTypes: [],
    startDate: "",
    endDate: "",
    minCookingTime: "",
    maxCookingTime: "",
    sortOrder: "asc",
    inPantry: false,
    ingredientName: null,
};

const baseProps = {
    filters: FILTERS,
    setSelectedTypes: jest.fn(),
    setMinCookingTime: jest.fn(),
    setMaxCookingTime: jest.fn(),
    setSortOrder: jest.fn(),
    setInPantry: jest.fn(),
    isPantryEmpty: false,
    types: [],
    descriptions: [],
    heading: "All recipes",
    subtitle: "Browse your cookbook",
    emptyTitle: "No recipes yet",
    emptyDescription: "Your cookbook is empty.",
    hasActiveFilters: false,
    clearFilters: jest.fn(),
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
        const clearFilters = jest.fn();

        renderWithRouter(
            <RecipeListView
                {...baseProps}
                recipes={[]}
                noRecipes={true}
                error={null}
                hasActiveFilters={true}
                filters={{ ...FILTERS, ingredientName: "cauliflower" }}
                clearFilters={clearFilters}
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

        expect(clearFilters).toHaveBeenCalledTimes(1);
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

    it("should mark a card as mine when its person_id matches the current user, even without the mine prop", () => {
        renderWithRouter(
            <RecipeListView
                {...baseProps}
                recipes={[{ ...RECIPES[0], person_id: 7 }]}
                noRecipes={false}
                error={null}
                currentUserId={7}
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
                recipes={[{ ...RECIPES[0], person_id: 7 }]}
                noRecipes={false}
                error={null}
                currentUserId={9}
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
