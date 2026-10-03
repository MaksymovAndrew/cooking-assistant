import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AuthLayout } from "components/auth/AuthLayout";

import { renderWithRouter } from "test/router";

const renderLayout = () =>
    renderWithRouter(
        <AuthLayout tagline="Tagline" description="Description">
            <p>Form content</p>
        </AuthLayout>,
    );

describe("AuthLayout", () => {
    it("should render the card as the main landmark", () => {
        renderLayout();

        expect(screen.getByRole("main")).toHaveTextContent("Form content");
    });

    it("should offer the skip link before anything else", async () => {
        renderLayout();

        await userEvent.tab();

        expect(
            screen.getByRole("link", { name: "Skip to content" }),
        ).toHaveFocus();
    });

    it("should skip straight to the form", async () => {
        renderLayout();

        await userEvent.click(
            screen.getByRole("link", { name: "Skip to content" }),
        );

        expect(screen.getByRole("main")).toHaveFocus();
    });

    it("should link both the illustration and mobile brand back to the home route", () => {
        renderLayout();

        const homeLinks = screen
            .getAllByRole("link")
            .filter((link) => link.textContent.includes("Cooking Assistant"));

        expect(homeLinks).toHaveLength(2);

        for (const link of homeLinks) {
            expect(link).toHaveAttribute("href", "/");
        }
    });
});
