import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { LinkButton } from "components/ui/LinkButton";

describe("LinkButton", () => {
    it("should render as a link to the given destination", () => {
        render(
            <MemoryRouter>
                <LinkButton to="/add-recipe">New recipe</LinkButton>
            </MemoryRouter>,
        );

        expect(
            screen.getByRole("link", { name: "New recipe" }),
        ).toHaveAttribute("href", "/add-recipe");
    });

    it("should apply the primary variant class by default", () => {
        render(
            <MemoryRouter>
                <LinkButton to="/add-recipe">New recipe</LinkButton>
            </MemoryRouter>,
        );

        expect(screen.getByRole("link")).toHaveClass("button--primary");
    });

    it("should apply the requested variant and size classes", () => {
        render(
            <MemoryRouter>
                <LinkButton to="/add-recipe" variant="secondary" size="sm">
                    New recipe
                </LinkButton>
            </MemoryRouter>,
        );

        const link = screen.getByRole("link");

        expect(link).toHaveClass("button--secondary");
        expect(link).toHaveClass("button--sm");
    });
});
