import { render, screen } from "@testing-library/react";

import { MenuMissingIngredientsPanel } from "components/menu/MenuMissingIngredientsPanel";

describe("MenuMissingIngredientsPanel", () => {
    it("should render the section heading, count badge and each missing ingredient", () => {
        render(
            <MenuMissingIngredientsPanel
                ingredients={{ Tomato: { quantity: 2, unit: "kg" } }}
            />,
        );

        expect(screen.getByText("Missing ingredients")).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("Tomato")).toBeInTheDocument();
        expect(screen.getByText("2 kg")).toBeInTheDocument();
    });

    it("should show a positive message when there is nothing missing", () => {
        render(<MenuMissingIngredientsPanel ingredients={{}} />);

        expect(screen.getByText("Missing ingredients")).toBeInTheDocument();
        expect(
            screen.getByText("You have everything this menu needs."),
        ).toBeInTheDocument();
    });
});
