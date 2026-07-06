import { render, screen } from "@testing-library/react";

import { AuthLayout } from "components/auth/AuthLayout";

describe("AuthLayout", () => {
    it("should render the tagline and description", () => {
        render(
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
        render(
            <AuthLayout tagline="Tagline" description="Description">
                <p>Form content</p>
            </AuthLayout>,
        );

        expect(screen.getByText("Form content")).toBeInTheDocument();
    });

    it("should render the app name twice (illustration + mobile header)", () => {
        render(
            <AuthLayout tagline="Tagline" description="Description">
                <p>Form content</p>
            </AuthLayout>,
        );

        expect(screen.getAllByText("Cooking Assistant")).toHaveLength(2);
    });
});
