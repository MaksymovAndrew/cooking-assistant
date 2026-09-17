import { render, screen } from "@testing-library/react";

import { ShoppingListHeader } from "components/shopping-list/ShoppingListHeader";

describe("ShoppingListHeader", () => {
    it("should show the counts and the progress for a list", () => {
        render(
            <ShoppingListHeader counts={{ toBuy: 6, bought: 2, total: 8 }} />,
        );

        expect(
            screen.getByRole("heading", { name: "Shopping list", level: 1 }),
        ).toBeInTheDocument();
        expect(screen.getByText("6 items to buy")).toBeInTheDocument();
        expect(screen.getByText("2 bought · 8 total")).toBeInTheDocument();
        expect(screen.getByText("25%")).toBeInTheDocument();
    });

    it("should show only the heading when there is nothing to count", () => {
        render(<ShoppingListHeader counts={null} />);

        expect(screen.queryByText(/to buy/)).not.toBeInTheDocument();
        expect(screen.queryByText(/ticked off/)).not.toBeInTheDocument();
    });
});
