import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MenuCategorySelect } from "components/menu/MenuCategorySelect";

const CATEGORIES = [{ menu_category_id: 1, category_name: "Dinner" }];

describe("MenuCategorySelect", () => {
    it("should render label, placeholder option and category options", () => {
        render(
            <MenuCategorySelect
                id="menu-category"
                label="Menu category"
                placeholder="Select a menu category"
                categories={CATEGORIES}
                value={null}
                error={null}
                onChange={jest.fn()}
            />,
        );

        expect(screen.getByLabelText("Menu category")).toBeInTheDocument();
        expect(
            screen.getByRole("option", { name: "Select a menu category" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("option", { name: "Dinner" }),
        ).toBeInTheDocument();
    });

    it("should render error message when provided", () => {
        render(
            <MenuCategorySelect
                id="menu-category"
                label="Menu category"
                placeholder="Select"
                categories={[]}
                value={null}
                error="Please select a menu category."
                onChange={jest.fn()}
            />,
        );

        expect(
            screen.getByText("Please select a menu category."),
        ).toBeInTheDocument();
    });

    it("should call onChange with the numeric id when a category is selected", async () => {
        const onChange = jest.fn();

        render(
            <MenuCategorySelect
                id="menu-category"
                label="Menu category"
                placeholder="Select a menu category"
                categories={CATEGORIES}
                value={null}
                error={null}
                onChange={onChange}
            />,
        );

        await userEvent.selectOptions(screen.getByRole("combobox"), "1");

        expect(onChange).toHaveBeenCalledWith(1);
    });

    it("should call onChange with null when the selection is cleared", () => {
        const onChange = jest.fn();

        render(
            <MenuCategorySelect
                id="menu-category"
                label="Menu category"
                placeholder="Select a menu category"
                categories={CATEGORIES}
                value={1}
                error={null}
                onChange={onChange}
            />,
        );

        fireEvent.change(screen.getByRole("combobox"), {
            target: { value: "" },
        });

        expect(onChange).toHaveBeenCalledWith(null);
    });
});
