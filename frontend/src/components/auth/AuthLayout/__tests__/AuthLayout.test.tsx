import { screen } from "@testing-library/react";

import { AuthLayout } from "components/auth/AuthLayout";

import { renderWithRouter } from "test/router";

describe("AuthLayout", () => {
    it("should render the tagline and description", () => {
        renderWithRouter(
            <AuthLayout
                tagline="Your personal cookbook"
                description="Organise recipes."
            >
                <p>Form content</p>
            </AuthLayout>,
        );

        expect(screen.getByText("Your personal cookbook")).toBeInTheDocument();
        expect(screen.getByText("Organise recipes.")).toBeInTheDocument();
    });

    it("should render the children inside the card", () => {
        renderWithRouter(
            <AuthLayout tagline="Tagline" description="Description">
                <p>Form content</p>
            </AuthLayout>,
        );

        expect(screen.getByText("Form content")).toBeInTheDocument();
    });

    it("should render the app name twice (illustration + mobile header)", () => {
        renderWithRouter(
            <AuthLayout tagline="Tagline" description="Description">
                <p>Form content</p>
            </AuthLayout>,
        );

        expect(screen.getAllByText("Cooking Assistant")).toHaveLength(2);
    });

    it("should link both the illustration and mobile brand back to the home route", () => {
        renderWithRouter(
            <AuthLayout tagline="Tagline" description="Description">
                <p>Form content</p>
            </AuthLayout>,
        );

        const homeLinks = screen
            .getAllByRole("link")
            .filter((link) => link.textContent.includes("Cooking Assistant"));

        expect(homeLinks).toHaveLength(2);

        for (const link of homeLinks) {
            expect(link).toHaveAttribute("href", "/");
        }
    });
});
