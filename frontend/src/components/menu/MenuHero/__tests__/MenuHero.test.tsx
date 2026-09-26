import { screen } from "@testing-library/react";

import type { MenuDetails } from "types/menu";

import { MenuHero } from "components/menu/MenuHero";

import { TEST_AUTHOR, TEST_UNRATED } from "test/constants";
import { renderWithRouter } from "test/router";

const MENU_TITLE = "Sunday dinners";
const CALORIES_LABEL = "620 kcal";
const OVER_BUDGET_TOOLTIP = "Exceeds your remaining calories for today";

const BASE_MENU: MenuDetails["menu"] = {
    id: 1,
    title: MENU_TITLE,
    language: "en",
    categoryname: "Dinner",
    menucontent: "Slow-cooked, soul-warming Sunday evening meals.",
    category_id: 1,
    isOwner: false,
    photo_key: null,
    ...TEST_UNRATED,
    author: TEST_AUTHOR,
    isFavourite: false,
};

const baseProps = {
    menu: BASE_MENU,
    totalCookingTime: 90,
    recipeCount: 3,
    caloriesPerPortion: null,
};

describe("MenuHero", () => {
    it("should render the title, category chip and description", () => {
        renderWithRouter(<MenuHero {...baseProps} />);

        expect(
            screen.getByRole("heading", { name: MENU_TITLE }),
        ).toBeInTheDocument();
        expect(screen.getByText("Dinner")).toBeInTheDocument();
        expect(
            screen.getByText("Slow-cooked, soul-warming Sunday evening meals."),
        ).toBeInTheDocument();
    });

    it("should show the total cooking time and recipe count stats", () => {
        renderWithRouter(<MenuHero {...baseProps} />);

        // shown twice: the labeled stats row (tablet+) and the compact mobile meta
        expect(screen.getAllByText("1h 30m")).toHaveLength(2);
        expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("should show the total calories stat when the menu has calorie data", () => {
        renderWithRouter(<MenuHero {...baseProps} caloriesPerPortion={620} />);

        expect(screen.getAllByText(CALORIES_LABEL)).toHaveLength(2);
    });

    it("should recolor both calorie stats when exceedsBudget is true", () => {
        renderWithRouter(
            <MenuHero {...baseProps} caloriesPerPortion={620} exceedsBudget />,
        );

        const [tabletStat, mobileStat] =
            screen.getAllByTitle(OVER_BUDGET_TOOLTIP);

        expect(tabletStat).toHaveClass("menu-hero__stat--calorie-over");
        expect(mobileStat).toHaveClass(
            "menu-hero__mobile-meta-item--calorie-over",
        );
    });

    it("should not recolor the calorie stats by default", () => {
        renderWithRouter(<MenuHero {...baseProps} caloriesPerPortion={620} />);

        expect(
            screen.queryByTitle(OVER_BUDGET_TOOLTIP),
        ).not.toBeInTheDocument();
    });

    it("should not show a calories stat when the menu has no calorie data", () => {
        renderWithRouter(<MenuHero {...baseProps} />);

        expect(screen.queryByText(/kcal/)).not.toBeInTheDocument();
    });

    it("should offer the stars to a signed-in visitor, showing their own vote", () => {
        renderWithRouter(
            <MenuHero
                {...baseProps}
                menu={{
                    ...BASE_MENU,
                    ratingAverage: 4.5,
                    ratingCount: 2,
                    myRating: 4,
                }}
            />,
        );

        expect(
            screen.getByRole("radiogroup", { name: "Your rating" }),
        ).toBeInTheDocument();
        expect(screen.getByRole("radio", { name: "4 stars" })).toBeChecked();
        expect(
            screen.getByRole("button", { name: "Remove my rating" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("img", {
                name: "Rated 4.5 out of 5 from 2 ratings",
            }),
        ).toBeInTheDocument();
    });

    it("should not offer the stars on the viewer's own menu", () => {
        renderWithRouter(
            <MenuHero {...baseProps} menu={{ ...BASE_MENU, isOwner: true }} />,
        );

        expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    });

    it("should say an unrated menu has no ratings yet", () => {
        renderWithRouter(<MenuHero {...baseProps} />);

        expect(screen.getAllByText("No ratings yet")[0]).toBeInTheDocument();
    });

    it("should show a cover only when the menu has one", () => {
        const { unmount } = renderWithRouter(<MenuHero {...baseProps} />);

        expect(screen.queryByAltText(MENU_TITLE)).not.toBeInTheDocument();
        unmount();

        renderWithRouter(
            <MenuHero
                {...baseProps}
                menu={{
                    ...BASE_MENU,
                    photo_key: "0b8f5a3e-2c4d-4e6f-8a1b-3c5d7e9f1a2b",
                }}
            />,
        );

        expect(screen.getByAltText(MENU_TITLE)).toBeInTheDocument();
    });

    it("should credit the author by first name and surname initial", () => {
        renderWithRouter(<MenuHero {...baseProps} />);

        expect(screen.getByText("by Test U.")).toBeInTheDocument();
    });
});
