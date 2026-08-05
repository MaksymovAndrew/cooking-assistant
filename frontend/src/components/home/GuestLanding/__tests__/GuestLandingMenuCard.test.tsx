import { screen } from "@testing-library/react";

import { GuestLandingMenuCard } from "components/home/GuestLanding/GuestLandingMenuCard";

import { renderWithRouter } from "test/router";

describe("GuestLandingMenuCard", () => {
    it("should show the course count, title and description, linking to the menu", () => {
        renderWithRouter(
            <GuestLandingMenuCard
                id={12}
                title="Sunday long lunch"
                description="Slow braise, two sides and a cold dessert."
                recipeCount={4}
            />,
        );

        expect(screen.getByText("4 courses")).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { name: "Sunday long lunch" }),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Slow braise, two sides and a cold dessert."),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /Sunday long lunch/ }),
        ).toHaveAttribute("href", "/menu/12");
    });

    it("should singularize the course count for a single recipe", () => {
        renderWithRouter(
            <GuestLandingMenuCard
                id={1}
                title="Weeknight in 45"
                description="One pan, one pot, one bowl."
                recipeCount={1}
            />,
        );

        expect(screen.getByText("1 course")).toBeInTheDocument();
    });
});
