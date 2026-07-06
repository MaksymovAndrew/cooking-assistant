import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { IngredientsPageHeader } from "components/ingredients/IngredientsPageHeader";

describe("IngredientsPageHeader", () => {
    it("should show the item count", () => {
        render(
            <IngredientsPageHeader
                count={3}
                isEditingQuantity={false}
                onToggleQuantityEdit={jest.fn()}
                onSaveQuantities={jest.fn()}
                onAddIngredient={jest.fn()}
            />,
        );

        expect(screen.getByText("3 items in your pantry")).toBeInTheDocument();
    });

    it("should call onToggleQuantityEdit when Edit quantities is clicked", async () => {
        const onToggleQuantityEdit = jest.fn();

        render(
            <IngredientsPageHeader
                count={3}
                isEditingQuantity={false}
                onToggleQuantityEdit={onToggleQuantityEdit}
                onSaveQuantities={jest.fn()}
                onAddIngredient={jest.fn()}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Edit quantities" }),
        );

        expect(onToggleQuantityEdit).toHaveBeenCalledTimes(1);
    });

    it("should show Save quantities and hide Add ingredient while editing quantities", async () => {
        const onSaveQuantities = jest.fn();

        render(
            <IngredientsPageHeader
                count={3}
                isEditingQuantity={true}
                onToggleQuantityEdit={jest.fn()}
                onSaveQuantities={onSaveQuantities}
                onAddIngredient={jest.fn()}
            />,
        );

        expect(
            screen.queryByRole("button", { name: "Add ingredient" }),
        ).not.toBeInTheDocument();

        await userEvent.click(
            screen.getByRole("button", { name: "Save quantities" }),
        );

        expect(onSaveQuantities).toHaveBeenCalledTimes(1);
    });

    it("should call onAddIngredient when Add ingredient is clicked", async () => {
        const onAddIngredient = jest.fn();

        render(
            <IngredientsPageHeader
                count={3}
                isEditingQuantity={false}
                onToggleQuantityEdit={jest.fn()}
                onSaveQuantities={jest.fn()}
                onAddIngredient={onAddIngredient}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Add ingredient" }),
        );

        expect(onAddIngredient).toHaveBeenCalledTimes(1);
    });
});
