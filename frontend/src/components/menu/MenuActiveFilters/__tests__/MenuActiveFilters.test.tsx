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
                searchQuery={null}
                removeSearch={jest.fn()}
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
                searchQuery={null}
                removeSearch={jest.fn()}
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
                searchQuery={null}
                removeSearch={jest.fn()}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Reset filters" }),
        );

        expect(setSelectedCategories).toHaveBeenCalledWith([]);
    });

    it("should show a removable chip for an active search query", () => {
        render(
            <MenuActiveFilters
                total={3}
                selectedCategories={[]}
                setSelectedCategories={jest.fn()}
                searchQuery="cauliflower"
                removeSearch={jest.fn()}
            />,
        );

        expect(screen.getByText("“cauliflower”")).toBeInTheDocument();
    });

    it("should call removeSearch when the search chip is dismissed", async () => {
        const removeSearch = jest.fn();

        render(
            <MenuActiveFilters
                total={3}
                selectedCategories={[]}
                setSelectedCategories={jest.fn()}
                searchQuery="cauliflower"
                removeSearch={removeSearch}
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Remove" }));

        expect(removeSearch).toHaveBeenCalledTimes(1);
    });
});
