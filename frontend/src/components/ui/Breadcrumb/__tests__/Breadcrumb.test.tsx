import { screen } from "@testing-library/react";

import { ROUTES } from "constants/routes";

import { Breadcrumb } from "components/ui/Breadcrumb";

import { renderWithRouter } from "test/router";

const renderBreadcrumb = () =>
    renderWithRouter(
        <Breadcrumb
            label="Breadcrumb"
            parentHref={ROUTES.allRecipes}
            parentLabel="Recipes"
            current="Borscht"
        />,
    );

describe("Breadcrumb", () => {
    it("should render a labelled navigation landmark", () => {
        renderBreadcrumb();

        expect(
            screen.getByRole("navigation", { name: "Breadcrumb" }),
        ).toBeInTheDocument();
    });

    it("should link back to the parent page", () => {
        renderBreadcrumb();

        expect(screen.getByRole("link", { name: "Recipes" })).toHaveAttribute(
            "href",
            ROUTES.allRecipes,
        );
    });

    it("should show the current page as plain text", () => {
        renderBreadcrumb();

        expect(screen.getByText("Borscht")).toBeInTheDocument();
        expect(
            screen.queryByRole("link", { name: "Borscht" }),
        ).not.toBeInTheDocument();
    });
});
