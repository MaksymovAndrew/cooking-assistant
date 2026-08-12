import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RecipeWithIngredientNames } from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import { HomeDashboard } from "components/home/HomeDashboard";
import { ModalRoot } from "components/modals";

import { mockGetByUrl } from "test/apiClientMock";
import { renderWithProviders } from "test/router";

jest.mock("api/client");

const RECIPE: RecipeWithIngredientNames = {
    id: 1,
    title: "Borscht",
    type_name: "Soup",
    creation_date: "2024-01-01",
    cooking_time: 60,
    ingredients: ["beet"],
};

const stubData = () => {
    mockGetByUrl({
        [API_ROUTES.recipes.list]: [RECIPE],
        [API_ROUTES.recipes.byPerson]: { items: [RECIPE], total: 1 },
        [API_ROUTES.menu.allUnpaginated]: [],
        [API_ROUTES.userIngredients.list]: [],
        [API_ROUTES.auth.me]: null,
    });
};

describe("HomeDashboard", () => {
    it("should show a spinner while the dashboard data is loading", () => {
        stubData();

        renderWithProviders(<HomeDashboard />);

        expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should render the greeting, stats and recent recipes once loaded", async () => {
        stubData();

        renderWithProviders(<HomeDashboard />);

        expect(await screen.findByText("Welcome back 👋")).toBeInTheDocument();
        expect(screen.getByText("Borscht")).toBeInTheDocument();
        expect(screen.getByText("Nothing expiring soon.")).toBeInTheDocument();
    });

    it("should show an error message when a query fails", async () => {
        mockGetByUrl({
            [API_ROUTES.recipes.list]: [RECIPE],
            [API_ROUTES.recipes.byPerson]: { items: [RECIPE], total: 1 },
            [API_ROUTES.menu.allUnpaginated]: [],
            [API_ROUTES.auth.me]: null,
        });

        renderWithProviders(<HomeDashboard />);

        expect(
            await screen.findByText("Something went wrong"),
        ).toBeInTheDocument();
    });

    // the news modal is enqueued, so it renders from ModalRoot rather than from the dashboard
    it("should open and close the news modal", async () => {
        stubData();

        renderWithProviders(
            <>
                <HomeDashboard />
                <ModalRoot />
            </>,
        );

        await userEvent.click(
            await screen.findByRole("button", { name: "News" }),
        );

        expect(screen.getByRole("dialog")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: "Close" }));

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});
