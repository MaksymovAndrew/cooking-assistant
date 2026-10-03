import { screen } from "@testing-library/react";

import type { Menu } from "types/menu";

import { API_ROUTES } from "api/endpoints";

import { GuestLandingMenus } from "components/home/GuestLanding/GuestLandingMenus";

import { mockedGet, mockGetByUrl } from "test/apiClientMock";
import { renderWithRouter } from "test/router";

jest.mock("api/client");

const MENU_TITLE = "Sunday long lunch";

const SAMPLE_MENUS = [
    {
        id: 1,
        title: MENU_TITLE,
        categoryName: "Dinner",
        menuContent: "Slow braise, two sides and a cold dessert.",
        recipe_count: 4,
    },
];

const SERVER_MENU: Menu = {
    id: 3,
    title: "Weeknight soups",
    categoryName: "Dinner",
    menuContent: "Three soups for a cold week.",
    recipe_count: 3,
};

describe("GuestLandingMenus", () => {
    it("should show the menus the server brought without asking for them again", () => {
        renderWithRouter(<GuestLandingMenus menus={[SERVER_MENU]} />);

        expect(screen.getByText("Weeknight soups")).toBeInTheDocument();
        expect(mockedGet).not.toHaveBeenCalled();
    });

    it("should render a card for each fetched menu and a link to the full list", async () => {
        mockGetByUrl({
            [API_ROUTES.menu.list]: {
                items: SAMPLE_MENUS,
                total: SAMPLE_MENUS.length,
            },
        });

        renderWithRouter(<GuestLandingMenus menus={null} />);

        expect(await screen.findByText(MENU_TITLE)).toBeInTheDocument();
        expect(
            screen.getByText("Category: Dinner · 4 recipes"),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /See all menus/ }),
        ).toHaveAttribute("href", "/all-menus");
    });

    it("should show an empty state when there are no menus yet", async () => {
        mockGetByUrl({
            [API_ROUTES.menu.list]: { items: [], total: 0 },
        });

        renderWithRouter(<GuestLandingMenus menus={null} />);

        expect(await screen.findByText("No menus yet")).toBeInTheDocument();
    });
});
