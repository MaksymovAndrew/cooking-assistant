import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MenuActiveFilters } from "components/menu/MenuActiveFilters";

describe("MenuActiveFilters", () => {
    it("should show the menu count", () => {
        render(
            <MenuActiveFilters
                total={3}
                selectedCategories={[]}
                setSelectedCategories={jest.fn()}
            />,
        );

        expect(screen.getByText("3 menus")).toBeInTheDocument();
    });

    it("should not show the clear button when no category is selected", () => {
        render(
            <MenuActiveFilters
                total={3}
                selectedCategories={[]}
                setSelectedCategories={jest.fn()}
            />,
        );

        expect(
            screen.queryByRole("button", { name: "Reset filters" }),
        ).not.toBeInTheDocument();
    });

    it("should clear the selected categories when the clear button is clicked", async () => {
        const setSelectedCategories = jest.fn();

        render(
            <MenuActiveFilters
                total={3}
                selectedCategories={[1]}
                setSelectedCategories={setSelectedCategories}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Reset filters" }),
        );

        expect(setSelectedCategories).toHaveBeenCalledWith([]);
    });
});
