import { screen } from "@testing-library/react";

import type { MenuDetails } from "types/menu";

import { MenuHero } from "components/menu/MenuHero";

import { renderWithRouter } from "test/router";

const CALORIES_LABEL = "620 kcal";
const OVER_BUDGET_TOOLTIP = "Exceeds your remaining calories for today";

const BASE_MENU: MenuDetails["menu"] = {
    id: 1,
    title: "Sunday dinners",
    categoryname: "Dinner",
    menucontent: "Slow-cooked, soul-warming Sunday evening meals.",
    category_id: 1,
    isOwner: false,
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
            screen.getByRole("heading", { name: "Sunday dinners" }),
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

    it("should not show the star-rating panel for a menu the viewer does not own", () => {
        renderWithRouter(<MenuHero {...baseProps} />);

        expect(screen.queryByText("Your rating")).not.toBeInTheDocument();
    });

    it("should show the star-rating panel when the viewer owns the menu", () => {
        renderWithRouter(
            <MenuHero {...baseProps} menu={{ ...BASE_MENU, isOwner: true }} />,
        );

        expect(screen.getByText("Your rating")).toBeInTheDocument();
    });
});
