import { render, screen } from "@testing-library/react";

import { ShoppingListProgress } from "components/shopping-list/ShoppingListProgress";

describe("ShoppingListProgress", () => {
    it("should show the rounded share of ticked items and a readable summary", () => {
        render(<ShoppingListProgress bought={1} total={3} />);

        expect(screen.getByText("33%")).toBeInTheDocument();
        expect(screen.getByText("1 of 3 ticked off")).toBeInTheDocument();
    });

    it("should swap the percentage for a check once everything is bought", () => {
        render(<ShoppingListProgress bought={4} total={4} />);

        expect(screen.queryByText("100%")).not.toBeInTheDocument();
        expect(screen.getByText("4 of 4 ticked off")).toBeInTheDocument();
    });

    it("should draw no arc before anything is ticked", () => {
        render(<ShoppingListProgress bought={0} total={5} />);

        expect(screen.getByText("0%")).toBeInTheDocument();
        expect(
            screen.queryByTestId("progress-ring-arc"),
        ).not.toBeInTheDocument();
    });
});
