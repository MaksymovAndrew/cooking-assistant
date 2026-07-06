import { screen } from "@testing-library/react";

import { MenuCard } from "components/menu/MenuCard";

import { renderWithRouter } from "test/router";

const TITLE = "Weekday menu";
const CATEGORY = "Lunch";

describe("MenuCard", () => {
    it("should render the menu title as a link to its details page", () => {
        renderWithRouter(
            <MenuCard id={1} title={TITLE} categoryName={CATEGORY} />,
        );

        expect(
            screen.getByRole("link", { name: new RegExp(TITLE) }),
        ).toHaveAttribute("href", "/menu/1");
    });

    it("should render the category as the chip label", () => {
        renderWithRouter(
            <MenuCard id={1} title={TITLE} categoryName={CATEGORY} />,
        );

        expect(screen.getByText(CATEGORY)).toBeInTheDocument();
    });

    it("should apply the mine class when mine is true", () => {
        renderWithRouter(
            <MenuCard id={1} title={TITLE} categoryName={CATEGORY} mine />,
        );

        expect(screen.getByRole("link")).toHaveClass("content-card--mine");
    });
});
