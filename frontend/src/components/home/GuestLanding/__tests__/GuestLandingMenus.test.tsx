import { screen } from "@testing-library/react";

import { API_ROUTES } from "api/endpoints";

import { GuestLandingMenus } from "components/home/GuestLanding/GuestLandingMenus";

import { mockGetByUrl } from "test/apiClientMock";
import { renderWithRouter } from "test/router";

jest.mock("api/client");

const MENU_TITLE = "Sunday long lunch";

const SAMPLE_MENUS = [
    {
        id: 1,
        title: MENU_TITLE,
        categoryname: "Dinner",
        menucontent: "Slow braise, two sides and a cold dessert.",
        recipe_count: 4,
    },
];

describe("GuestLandingMenus", () => {
    it("should render a card for each fetched menu and a link to the full list", async () => {
        mockGetByUrl({
            [API_ROUTES.menu.list]: {
                items: SAMPLE_MENUS,
                total: SAMPLE_MENUS.length,
            },
        });

        renderWithRouter(<GuestLandingMenus />);

        expect(await screen.findByText(MENU_TITLE)).toBeInTheDocument();
        expect(screen.getByText("4 courses")).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /See all menus/ }),
        ).toHaveAttribute("href", "/all-menus");
    });

    it("should show an empty state when there are no menus yet", async () => {
        mockGetByUrl({
            [API_ROUTES.menu.list]: { items: [], total: 0 },
        });

        renderWithRouter(<GuestLandingMenus />);

        expect(await screen.findByText("No menus yet")).toBeInTheDocument();
    });
});
