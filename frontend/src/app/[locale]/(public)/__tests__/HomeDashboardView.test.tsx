import { screen } from "@testing-library/react";

import { API_ROUTES } from "api/endpoints";

import { HomeDashboardView } from "app/[locale]/(public)/HomeDashboardView";
import { mockGetByUrl } from "test/apiClientMock";
import { renderWithProviders } from "test/router";

jest.mock("api/client");

describe("HomeDashboardView", () => {
    it("should render the dashboard inside the app shell", async () => {
        mockGetByUrl({
            [API_ROUTES.recipes.list]: [],
            [API_ROUTES.recipes.byPerson]: { items: [], total: 0 },
            [API_ROUTES.menu.allUnpaginated]: [],
            [API_ROUTES.userIngredients.list]: [],
            [API_ROUTES.auth.me]: null,
        });

        renderWithProviders(<HomeDashboardView />);

        expect(await screen.findByText("Welcome back 👋")).toBeInTheDocument();
    });
});
