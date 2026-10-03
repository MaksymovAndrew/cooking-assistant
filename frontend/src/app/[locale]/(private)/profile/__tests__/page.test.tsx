import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { CurrentUser } from "types/auth";
import type { Menu } from "types/menu";
import type { RecipeSearchResultItem } from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import { ModalRoot } from "components/modals";

import ProfilePage from "app/[locale]/(private)/profile/page";
import { mockedGet, mockGetByUrl } from "test/apiClientMock";
import { TEST_AUTHOR, TEST_UNRATED } from "test/constants";
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
    avatar_photo_key: null,
    calorie_goal: null,
    locale: "en",
};
const RECIPE: RecipeSearchResultItem = {
    id: 1,
    title: "Borscht",
    language: "en",
    type_name: "Soup",
    creation_date: "2024-01-01",
    cooking_time: 60,
    calories_per_portion: null,
    ingredients: [],
    isOwner: true,
    photo_key: null,
    ...TEST_UNRATED,
    author: TEST_AUTHOR,
    isFavourite: false,
    containsAvoided: false,
    tags: [],
};
const FAVOURITE_RECIPE: RecipeSearchResultItem = {
    ...RECIPE,
    id: 2,
    title: "Pelmeni",
    isOwner: false,
    isFavourite: true,
    containsAvoided: false,
    tags: [],
};
const MENU: Menu = {
    id: 1,
    title: "Weekday menu",
    categoryName: "Lunch",
    menuContent: "",
    recipe_count: 3,
};

const stubApi = () => {
    mockGetByUrl({
        [API_ROUTES.auth.me]: CURRENT_USER,
        [API_ROUTES.recipes.byPerson]: { items: [RECIPE], total: 1 },
        [API_ROUTES.menu.byPerson]: { items: [MENU], total: 1 },
        [API_ROUTES.recipes.byFilters]: { items: [FAVOURITE_RECIPE], total: 1 },
        [API_ROUTES.menu.list]: { items: [], total: 0 },
        [API_ROUTES.calories.intake]: [],
    });
};

const setup = () => {
    stubApi();

    return renderWithProviders(<ProfilePage />);
};

describe("ProfilePage", () => {
    it("should render the user's name and their recipes by default", async () => {
        setup();

        expect(await screen.findByText("Claude Cook")).toBeInTheDocument();
        expect(await screen.findByText("Borscht")).toBeInTheDocument();
    });

    it.each([
        ["My menus", "Weekday menu"],
        ["Favourites", "Pelmeni"],
        ["Dietary", "Calorie goal"],
    ])(
        "should show the %s tab's content once it is selected",
        async (tab, expectedText) => {
            setup();

            await screen.findByText("Borscht");

            await userEvent.click(screen.getByRole("tab", { name: tab }));

            expect(await screen.findByText(expectedText)).toBeInTheDocument();
        },
    );

    it("should show a loading state instead of an empty tab until the recipes arrive", async () => {
        setup();

        expect(screen.getByRole("status", { name: "Loading…" })).toBeVisible();
        expect(
            screen.queryByText("You haven't created any recipes yet."),
        ).not.toBeInTheDocument();
        expect(await screen.findByText("Borscht")).toBeInTheDocument();
    });

    it("should show an error with a retry when the active tab cannot be loaded", async () => {
        stubApi();
        const loadByUrl = mockedGet.getMockImplementation();
        let failures = 1;

        mockedGet.mockImplementation((url: string) => {
            if (url === API_ROUTES.recipes.byPerson && failures > 0) {
                failures -= 1;

                return Promise.reject(new Error("offline"));
            }

            return loadByUrl ? loadByUrl(url) : Promise.reject(new Error(url));
        });
        renderWithProviders(<ProfilePage />);

        await userEvent.click(
            await screen.findByRole("button", { name: "Try again" }),
        );

        expect(await screen.findByText("Borscht")).toBeInTheDocument();
    });

    it("should open the edit-profile dialog filled in with the user's name", async () => {
        stubApi();
        renderWithProviders(
            <>
                <ProfilePage />
                <ModalRoot />
            </>,
        );

        await screen.findByText("Claude Cook");
        await userEvent.click(
            screen.getByRole("button", { name: "Edit profile" }),
        );

        const dialog = await screen.findByRole("dialog", {
            name: "Edit profile",
        });

        expect(within(dialog).getByLabelText("Name")).toHaveValue(
            CURRENT_USER.name,
        );
        expect(within(dialog).getByLabelText("Surname")).toHaveValue(
            CURRENT_USER.surname,
        );
    });
});
