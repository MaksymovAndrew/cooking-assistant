import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { MenuDetails } from "types/menu";

import { MenuHero } from "components/menu/MenuHero";

import { renderWithProviders, renderWithRouter } from "test/router";
import { makeTestStore } from "test/store";

const LOG_INTAKE_BUTTON = "Log intake";
const LOG_INTAKE_CTA = "Log in to log intake";
const CALORIES_LABEL = "620 kcal";
const OVER_BUDGET_TOOLTIP = "Exceeds your remaining calories for today";
const AUTHED_STORE = makeTestStore({ session: { status: "authed" } });
const GUEST_STORE = makeTestStore({ session: { status: "guest" } });

const BASE_MENU: MenuDetails["menu"] = {
    id: 1,
    title: "Sunday dinners",
    categoryname: "Dinner",
    menucontent: "Slow-cooked, soul-warming Sunday evening meals.",
    category_id: 1,
    personid: 1,
    isOwner: false,
};

const baseProps = {
    menu: BASE_MENU,
    totalCookingTime: 90,
    recipeCount: 3,
    caloriesPerPortion: null,
    editTo: "/change-menu/1",
    onDelete: jest.fn(),
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

    it("should show just the Favourite button and no explanatory text for a visitor", () => {
        renderWithProviders(<MenuHero {...baseProps} />, {
            store: AUTHED_STORE,
        });

        expect(
            screen.queryByRole("link", { name: /Edit menu/ }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(/Viewing someone else's menu/),
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Favourite" }),
        ).toBeInTheDocument();
    });

    it("should show owner actions and call onDelete when the viewer owns the menu", async () => {
        const onDelete = jest.fn();

        renderWithRouter(
            <MenuHero
                {...baseProps}
                menu={{ ...BASE_MENU, isOwner: true }}
                onDelete={onDelete}
            />,
        );

        expect(screen.getByRole("link", { name: /Edit menu/ })).toHaveAttribute(
            "href",
            "/change-menu/1",
        );

        await userEvent.click(
            screen.getByRole("button", { name: /Delete menu/ }),
        );

        expect(onDelete).toHaveBeenCalledTimes(1);
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

    it("should show the log-intake button next to Favourite and call onLogIntake for a visitor", async () => {
        const onLogIntake = jest.fn();

        renderWithProviders(
            <MenuHero {...baseProps} onLogIntake={onLogIntake} />,
            { store: AUTHED_STORE },
        );

        await userEvent.click(
            screen.getByRole("button", { name: LOG_INTAKE_BUTTON }),
        );

        expect(onLogIntake).toHaveBeenCalledTimes(1);
    });

    it("should not show the log-intake button when onLogIntake is not provided", () => {
        renderWithProviders(<MenuHero {...baseProps} />, {
            store: AUTHED_STORE,
        });

        expect(
            screen.queryByRole("button", { name: LOG_INTAKE_BUTTON }),
        ).not.toBeInTheDocument();
    });

    it("should hide the favourite button for a guest", () => {
        renderWithProviders(<MenuHero {...baseProps} />, {
            store: GUEST_STORE,
        });

        expect(
            screen.queryByRole("button", { name: "Favourite" }),
        ).not.toBeInTheDocument();
    });

    it("should show a login CTA instead of the log-intake button for a guest", () => {
        renderWithProviders(
            <MenuHero {...baseProps} onLogIntake={jest.fn()} />,
            { store: GUEST_STORE },
        );

        expect(
            screen.queryByRole("button", { name: LOG_INTAKE_BUTTON }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: LOG_INTAKE_CTA }),
        ).toHaveAttribute("href", "/login");
    });

    it("should show a log-intake trigger for an owner and call onLogIntake when clicked", async () => {
        const onLogIntake = jest.fn();

        renderWithRouter(
            <MenuHero
                {...baseProps}
                menu={{ ...BASE_MENU, isOwner: true }}
                onLogIntake={onLogIntake}
            />,
        );

        const triggers = screen.getAllByRole("button", {
            name: LOG_INTAKE_BUTTON,
        });

        expect(triggers.length).toBeGreaterThan(0);

        await userEvent.click(triggers[0]);

        expect(onLogIntake).toHaveBeenCalledTimes(1);
    });
});
