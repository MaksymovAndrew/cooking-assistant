import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { MenuDetails } from "types/menu";

import { MenuHero } from "components/menu/MenuHero";

import { renderWithRouter } from "test/router";

const BASE_MENU: MenuDetails["menu"] = {
    id: 1,
    title: "Sunday dinners",
    categoryname: "Dinner",
    menucontent: "Slow-cooked, soul-warming Sunday evening meals.",
    category_id: 1,
    personid: 1,
    isOwner: false,
};

describe("MenuHero", () => {
    it("should render the title, category chip and description", () => {
        renderWithRouter(
            <MenuHero
                menu={BASE_MENU}
                totalCookingTime={90}
                recipeCount={3}
                editTo="/change-menu/1"
                onDelete={jest.fn()}
            />,
        );

        expect(
            screen.getByRole("heading", { name: "Sunday dinners" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Dinner")).toBeInTheDocument();
        expect(
            screen.getByText("Slow-cooked, soul-warming Sunday evening meals."),
        ).toBeInTheDocument();
    });

    it("should show the total cooking time and recipe count stats", () => {
        renderWithRouter(
            <MenuHero
                menu={BASE_MENU}
                totalCookingTime={90}
                recipeCount={3}
                editTo="/change-menu/1"
                onDelete={jest.fn()}
            />,
        );

        // shown twice: the labeled stats row (tablet+) and the compact mobile meta
        expect(screen.getAllByText("1h 30m")).toHaveLength(2);
        expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("should show the visitor banner instead of owner actions when the viewer does not own the menu", () => {
        renderWithRouter(
            <MenuHero
                menu={BASE_MENU}
                totalCookingTime={90}
                recipeCount={3}
                editTo="/change-menu/1"
                onDelete={jest.fn()}
            />,
        );

        expect(
            screen.queryByRole("link", { name: /Edit menu/ }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByText(/Viewing someone else's menu/),
        ).toBeInTheDocument();
    });

    it("should show owner actions and call onDelete when the viewer owns the menu", async () => {
        const onDelete = jest.fn();

        renderWithRouter(
            <MenuHero
                menu={{ ...BASE_MENU, isOwner: true }}
                totalCookingTime={90}
                recipeCount={3}
                editTo="/change-menu/1"
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
        renderWithRouter(
            <MenuHero
                menu={BASE_MENU}
                totalCookingTime={90}
                recipeCount={3}
                editTo="/change-menu/1"
                onDelete={jest.fn()}
            />,
        );

        expect(screen.queryByText("Your rating")).not.toBeInTheDocument();
    });

    it("should show the star-rating panel when the viewer owns the menu", () => {
        renderWithRouter(
            <MenuHero
                menu={{ ...BASE_MENU, isOwner: true }}
                totalCookingTime={90}
                recipeCount={3}
                editTo="/change-menu/1"
                onDelete={jest.fn()}
            />,
        );

        expect(screen.getByText("Your rating")).toBeInTheDocument();
    });
});
