import { screen } from "@testing-library/react";

import { API_ROUTES } from "api/endpoints";

import { GreetingHeader } from "components/home/GreetingHeader";

import { mockGetByUrl } from "test/apiClientMock";
import { renderWithRouter } from "test/router";

jest.mock("api/client");

describe("GreetingHeader", () => {
    it("should render the generic welcome message before the current user loads", () => {
        mockGetByUrl({ [API_ROUTES.auth.me]: null });

        renderWithRouter(<GreetingHeader />);

        expect(screen.getByText("Welcome back 👋")).toBeInTheDocument();
    });

    it("should greet the current user by name once loaded", async () => {
        mockGetByUrl({
            [API_ROUTES.auth.me]: {
                id: 1,
                name: "Claude",
                surname: "Cook",
                login: "claude",
            },
        });

        renderWithRouter(<GreetingHeader />);

        expect(
            await screen.findByText("Welcome back, Claude 👋"),
        ).toBeInTheDocument();
    });

    it("should link to the add-menu and add-recipe pages", () => {
        mockGetByUrl({ [API_ROUTES.auth.me]: null });

        renderWithRouter(<GreetingHeader />);

        expect(screen.getByRole("link", { name: "New menu" })).toHaveAttribute(
            "href",
            "/add-menu",
        );
        expect(
            screen.getByRole("link", { name: "New recipe" }),
        ).toHaveAttribute("href", "/add-recipe");
    });
});
