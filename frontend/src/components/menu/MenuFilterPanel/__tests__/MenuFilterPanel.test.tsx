import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MenuFilterPanel } from "components/menu/MenuFilterPanel";

import { renderWithRouter } from "test/router";

const CATEGORIES = [
    { menu_category_id: 1, category_name: "Lunch" },
    { menu_category_id: 2, category_name: "Dinner" },
];

const setup = (selectedCategories: number[] = []) => {
    const setSelectedCategories = jest.fn();

    renderWithRouter(
        <MenuFilterPanel
            categories={CATEGORIES}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            searchPlaceholder="menu title"
        />,
    );

    return { setSelectedCategories };
};

const openPanel = async () => {
    await userEvent.click(screen.getByRole("button", { name: /Filter/ }));
};

describe("MenuFilterPanel", () => {
    it("should not show the popover by default", () => {
        setup();

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should open the popover when the Filter trigger is clicked", async () => {
        setup();

        await openPanel();

        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should show a badge with the selected category count", () => {
        setup([1]);

        expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("should toggle a category when its chip is clicked", async () => {
        const { setSelectedCategories } = setup();

        await openPanel();
        await userEvent.click(screen.getByRole("checkbox", { name: "Lunch" }));

        expect(setSelectedCategories).toHaveBeenCalledWith([1]);
    });

    it("should clear every selected category when Reset filters is clicked", async () => {
        const { setSelectedCategories } = setup([1, 2]);

        await openPanel();
        await userEvent.click(
            screen.getByRole("button", { name: "Reset filters" }),
        );

        expect(setSelectedCategories).toHaveBeenCalledWith([]);
    });
});
