import { screen } from "@testing-library/react";

import { Logo } from "components/layout/Logo";

import { renderWithRouter } from "test/router";

const APP_NAME = "Cooking Assistant";

describe("Logo", () => {
    it("should render as a link to the given path", () => {
        renderWithRouter(<Logo to="/" />);

        expect(screen.getByRole("link", { name: APP_NAME })).toHaveAttribute(
            "href",
            "/",
        );
    });

    it("should render without a link when no target is given", () => {
        renderWithRouter(<Logo />);

        expect(
            screen.queryByRole("link", { name: APP_NAME }),
        ).not.toBeInTheDocument();
        expect(screen.getByText(APP_NAME)).toBeInTheDocument();
    });

    it("should hide the wordmark when withWordmark is false", () => {
        renderWithRouter(<Logo withWordmark={false} />);

        expect(screen.queryByText(APP_NAME)).not.toBeInTheDocument();
    });

    it.each([
        ["minimal"] as const,
        ["compact"] as const,
        ["simple"] as const,
        ["standard"] as const,
        ["detailed"] as const,
    ])("should render the %s variant", (variant) => {
        renderWithRouter(<Logo variant={variant} />);

        expect(screen.getByText(APP_NAME)).toBeInTheDocument();
    });
});
