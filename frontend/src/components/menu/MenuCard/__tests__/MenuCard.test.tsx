import { screen } from "@testing-library/react";

import { MenuCard } from "components/menu/MenuCard";

import { renderWithRouter } from "test/router";

const TITLE = "Weekday menu";
const CATEGORY = "Lunch";
const MENU = { id: 1, title: TITLE, categoryname: CATEGORY, recipe_count: 6 };

describe("MenuCard", () => {
    it("should render the menu title as a link to its details page", () => {
        renderWithRouter(<MenuCard menu={MENU} />);

        expect(
            screen.getByRole("link", { name: new RegExp(TITLE) }),
        ).toHaveAttribute("href", "/menu/1");
    });

    it("should render the category as the chip label", () => {
        renderWithRouter(<MenuCard menu={MENU} />);

        expect(screen.getByText(CATEGORY)).toBeInTheDocument();
    });

    it("should render the category and recipe count as the meta line", () => {
        renderWithRouter(<MenuCard menu={MENU} />);

        expect(
            screen.getByText("Category: Lunch · 6 recipes"),
        ).toBeInTheDocument();
    });

    it("should render a pressed heart for a menu the viewer favourited", () => {
        renderWithRouter(<MenuCard menu={{ ...MENU, isFavourite: true }} />);

        expect(
            screen.getByRole("button", { name: "Favourite" }),
        ).toHaveAttribute("aria-pressed", "true");
    });

    it("should not render a favourite button without a per-viewer flag", () => {
        renderWithRouter(<MenuCard menu={MENU} />);

        expect(
            screen.queryByRole("button", { name: "Favourite" }),
        ).not.toBeInTheDocument();
    });

    it("should apply the mine class when mine is true", () => {
        renderWithRouter(<MenuCard menu={MENU} mine />);

        expect(screen.getByRole("article")).toHaveClass("content-card--mine");
    });
});
