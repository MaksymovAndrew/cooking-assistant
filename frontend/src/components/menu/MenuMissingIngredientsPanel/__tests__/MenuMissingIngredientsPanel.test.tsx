import { screen } from "@testing-library/react";

import { MenuMissingIngredientsPanel } from "components/menu/MenuMissingIngredientsPanel";

import { renderWithProviders } from "test/router";

describe("MenuMissingIngredientsPanel", () => {
    it("should render the section heading, count badge and each missing ingredient", () => {
        renderWithProviders(
            <MenuMissingIngredientsPanel
                ingredients={{
                    Tomato: {
                        quantity: 2,
                        missingQuantity: 2,
                        unit: "kg",
                        sufficient: false,
                    },
                }}
                allergens={[]}
            />,
        );

        expect(screen.getByText("Ingredients")).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("Tomato")).toBeInTheDocument();
        expect(screen.getByText("2 kg")).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Go to pantry" }),
        ).toHaveAttribute("href", "/ingredients");
    });

    it("should mark a sufficient ingredient as having enough, without counting it in the badge", () => {
        renderWithProviders(
            <MenuMissingIngredientsPanel
                ingredients={{
                    Onion: {
                        quantity: 3,
                        missingQuantity: 0,
                        unit: "pcs",
                        sufficient: true,
                    },
                }}
                allergens={[]}
            />,
        );

        expect(screen.queryByText("1")).not.toBeInTheDocument();
        expect(screen.getByText("Onion")).toBeInTheDocument();
        expect(screen.getByText("3 pcs")).toBeInTheDocument();
        expect(screen.getByLabelText("You have enough")).toBeInTheDocument();
    });

    it("should show a positive message when the menu has no ingredients", () => {
        renderWithProviders(
            <MenuMissingIngredientsPanel ingredients={{}} allergens={[]} />,
        );

        expect(screen.getByText("Ingredients")).toBeInTheDocument();
        expect(
            screen.getByText("This menu has no ingredients yet."),
        ).toBeInTheDocument();
    });

    it("should render the allergens-across-menu chips when present", () => {
        renderWithProviders(
            <MenuMissingIngredientsPanel
                ingredients={{}}
                allergens={["Gluten", "Milk"]}
            />,
        );

        expect(screen.getByText("Allergens across menu")).toBeInTheDocument();
        expect(screen.getByText("Gluten")).toBeInTheDocument();
        expect(screen.getByText("Milk")).toBeInTheDocument();
    });
});
