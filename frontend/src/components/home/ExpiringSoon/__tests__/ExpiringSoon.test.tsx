import { screen } from "@testing-library/react";

import type { ExpiringIngredient } from "types/expiry";

import { ExpiringSoon } from "components/home/ExpiringSoon";

import { renderWithRouter } from "test/router";

const ITEM: ExpiringIngredient = {
    ingredientId: 1,
    name: "Milk",
    status: { tone: "warning", days: 2 },
};

describe("ExpiringSoon", () => {
    it("should render a row for each expiring item and a link to the pantry", () => {
        renderWithRouter(<ExpiringSoon items={[ITEM]} />);

        expect(screen.getByText("Milk")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Pantry →" })).toHaveAttribute(
            "href",
            "/ingredients",
        );
    });

    it("should show an empty message when nothing is expiring", () => {
        renderWithRouter(<ExpiringSoon items={[]} />);

        expect(screen.getByText("Nothing expiring soon.")).toBeInTheDocument();
    });

    it("should render the add-to-shopping-list action", () => {
        renderWithRouter(<ExpiringSoon items={[ITEM]} />);

        expect(
            screen.getByRole("button", { name: "+ Add to shopping list" }),
        ).toBeInTheDocument();
    });
});
