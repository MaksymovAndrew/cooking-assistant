import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { CurrentUser } from "types/auth";
import type { Menu } from "types/menu";
import type { RecipeSearchResultItem } from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import ProfilePage from "pages/profile/ProfilePage";
import { mockGetByUrl } from "test/apiClientMock";
import { renderWithProviders } from "test/router";

jest.mock("api/client");

const CURRENT_USER: CurrentUser = {
    id: 1,
    name: "Claude",
    surname: "Cook",
    login: "claude",
    created_at: "2025-06-15T00:00:00.000Z",
    email: "claude@example.com",
    email_verified_at: null,
    avatar: null,
};
const RECIPE: RecipeSearchResultItem = {
    id: 1,
    title: "Borscht",
    type_name: "Soup",
    creation_date: "2024-01-01",
    cooking_time: 60,
    calories_per_portion: null,
    ingredients: [],
};
const MENU: Menu = {
    id: 1,
    title: "Weekday menu",
    categoryname: "Lunch",
    menucontent: "",
    recipe_count: 3,
};

const setup = () => {
    mockGetByUrl({
        [API_ROUTES.auth.me]: CURRENT_USER,
        [API_ROUTES.recipes.byPerson]: { items: [RECIPE], total: 1 },
        [API_ROUTES.menu.byPerson]: { items: [MENU], total: 1 },
    });

    return renderWithProviders(<ProfilePage />);
};

describe("ProfilePage", () => {
    it("should render the user's name and their recipes by default", async () => {
        setup();

        expect(await screen.findByText("Claude Cook")).toBeInTheDocument();
        expect(await screen.findByText("Borscht")).toBeInTheDocument();
    });

    it("should switch to the menus tab", async () => {
        setup();

        await screen.findByText("Borscht");

        await userEvent.click(screen.getByRole("tab", { name: "My menus" }));

        expect(await screen.findByText("Weekday menu")).toBeInTheDocument();
    });

    it("should show a coming-soon placeholder for the Favourites tab", async () => {
        setup();

        await screen.findByText("Borscht");

        await userEvent.click(screen.getByRole("tab", { name: "Favourites" }));

        expect(
            screen.getByText("Coming in a future release."),
        ).toBeInTheDocument();
    });
});
