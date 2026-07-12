import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SelectedIngredientsList } from "components/recipes/SelectedIngredientsList";

const INGREDIENTS = [{ id: 1, name: "Potato", quantity: 3, unit_name: "g" }];

describe("SelectedIngredientsList", () => {
    it("should render ingredient name, quantity input and unit", () => {
        render(
            <SelectedIngredientsList
                ingredients={INGREDIENTS}
                onQuantityChange={jest.fn()}
                onRemove={jest.fn()}
                onReorder={jest.fn()}
            />,
        );

        expect(screen.getByText("Potato")).toBeInTheDocument();
        expect(screen.getByRole("spinbutton")).toHaveValue(3);
        expect(screen.getByText("g")).toBeInTheDocument();
    });

    it("should call onQuantityChange with the parsed number when the quantity changes", async () => {
        const onQuantityChange = jest.fn();

        render(
            <SelectedIngredientsList
                ingredients={INGREDIENTS}
                onQuantityChange={onQuantityChange}
                onRemove={jest.fn()}
                onReorder={jest.fn()}
            />,
        );

        await userEvent.type(screen.getByRole("spinbutton"), "5");

        expect(onQuantityChange).toHaveBeenCalledWith(1, 35);
    });

    it("should not call onQuantityChange when the quantity is cleared", async () => {
        const onQuantityChange = jest.fn();

        render(
            <SelectedIngredientsList
                ingredients={INGREDIENTS}
                onQuantityChange={onQuantityChange}
                onRemove={jest.fn()}
                onReorder={jest.fn()}
            />,
        );

        await userEvent.clear(screen.getByRole("spinbutton"));

        expect(onQuantityChange).not.toHaveBeenCalled();
    });

    it("should call onRemove with the ingredient id when the remove button is clicked", async () => {
        const onRemove = jest.fn();

        render(
            <SelectedIngredientsList
                ingredients={INGREDIENTS}
                onQuantityChange={jest.fn()}
                onRemove={onRemove}
                onReorder={jest.fn()}
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Remove" }));

        expect(onRemove).toHaveBeenCalledWith(INGREDIENTS[0].id);
    });
});
