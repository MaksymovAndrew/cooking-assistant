import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RecipeDetails } from "types/recipe";

import { RecipeHero } from "components/recipes/RecipeHero";

import { renderWithRouter } from "test/router";

const BASE_RECIPE: RecipeDetails = {
    id: 1,
    title: "Slow-roasted ragù",
    content: "A deeply savoury slow-cooked ragù.",
    ingredients: [],
    type_id: 1,
    type_name: "Main course",
    cooking_time: 85,
    creation_date: "2024-01-01",
    servings: "4 servings",
    person_id: 1,
    isOwner: false,
};

const baseProps = {
    recipe: BASE_RECIPE,
    canScaleServings: false,
    servingsCount: null,
    servingsDisplay: "4 servings",
    editTo: "/change-recipe/1",
    onDelete: jest.fn(),
};

describe("RecipeHero", () => {
    it("should render the title and type chip", () => {
        renderWithRouter(<RecipeHero {...baseProps} />);

        expect(
            screen.getByRole("heading", { name: "Slow-roasted ragù" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Main course")).toBeInTheDocument();
    });

    it("should show the given servings display value", () => {
        renderWithRouter(
            <RecipeHero {...baseProps} servingsDisplay="8 servings" />,
        );

        expect(screen.getByText("8 servings")).toBeInTheDocument();
    });

    it("should show a visitor banner and not owner actions when the viewer does not own the recipe", () => {
        renderWithRouter(<RecipeHero {...baseProps} />);

        expect(
            screen.queryByRole("link", { name: /Edit recipe/ }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByText(
                "Viewing someone else's recipe — Edit & Delete not available",
            ),
        ).toBeInTheDocument();
    });

    it("should not show the rating stat for a visitor", () => {
        renderWithRouter(<RecipeHero {...baseProps} />);

        expect(screen.queryByText("Your rating")).not.toBeInTheDocument();
    });

    it("should show owner actions, the rating stat and call onDelete when the viewer owns the recipe", async () => {
        const onDelete = jest.fn();

        renderWithRouter(
            <RecipeHero
                {...baseProps}
                recipe={{ ...BASE_RECIPE, isOwner: true }}
                onDelete={onDelete}
            />,
        );

        expect(
            screen.getByRole("link", { name: /Edit recipe/ }),
        ).toHaveAttribute("href", "/change-recipe/1");
        expect(screen.getByText("Your rating")).toBeInTheDocument();

        await userEvent.click(
            screen.getByRole("button", { name: /Delete recipe/ }),
        );

        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("should disable the favourite button since favourites are not wired up yet", () => {
        renderWithRouter(<RecipeHero {...baseProps} />);

        expect(
            screen.getAllByRole("button", { name: "Favourite" })[0],
        ).toBeDisabled();
    });
});
