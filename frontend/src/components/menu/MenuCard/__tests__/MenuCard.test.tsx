import { screen } from "@testing-library/react";

import { MenuCard } from "components/menu/MenuCard";

import { renderWithRouter } from "test/router";

const TITLE = "Weekday menu";
const CATEGORY = "Lunch";
const RECIPE_COUNT = 6;

describe("MenuCard", () => {
    it("should render the menu title as a link to its details page", () => {
        renderWithRouter(
            <MenuCard
                id={1}
                title={TITLE}
                categoryName={CATEGORY}
                recipeCount={RECIPE_COUNT}
            />,
        );

        expect(
            screen.getByRole("link", { name: new RegExp(TITLE) }),
        ).toHaveAttribute("href", "/menu/1");
    });

    it("should render the category as the chip label", () => {
        renderWithRouter(
            <MenuCard
                id={1}
                title={TITLE}
                categoryName={CATEGORY}
                recipeCount={RECIPE_COUNT}
            />,
        );

        expect(screen.getByText(CATEGORY)).toBeInTheDocument();
    });

    it("should render the category and recipe count as the meta line", () => {
        renderWithRouter(
            <MenuCard
                id={1}
                title={TITLE}
                categoryName={CATEGORY}
                recipeCount={RECIPE_COUNT}
            />,
        );

        expect(
            screen.getByText("Category: Lunch · 6 recipes"),
        ).toBeInTheDocument();
    });

    it("should not render a favourite button", () => {
        renderWithRouter(
            <MenuCard
                id={1}
                title={TITLE}
                categoryName={CATEGORY}
                recipeCount={RECIPE_COUNT}
            />,
        );

        expect(
            screen.queryByRole("button", { name: "Favourite" }),
        ).not.toBeInTheDocument();
    });

    it("should apply the mine class when mine is true", () => {
        renderWithRouter(
            <MenuCard
                id={1}
                title={TITLE}
                categoryName={CATEGORY}
                recipeCount={RECIPE_COUNT}
                mine
            />,
        );

        expect(screen.getByRole("link")).toHaveClass("content-card--mine");
    });
});
