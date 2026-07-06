import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { PantryIngredient } from "types/userIngredient";

import { IngredientCard } from "components/ingredients/IngredientCard";

const BASE_INGREDIENT: PantryIngredient = {
    id: 1,
    ingredient_name: "Carrot",
    unit_name: "kg",
    quantity_person_ingradient: 3,
    allergens: "None",
    days_to_expire: null,
    purchase_date: undefined,
};

describe("IngredientCard", () => {
    it("should render the name, quantity and unit", () => {
        render(
            <IngredientCard
                ingredient={BASE_INGREDIENT}
                isEditingQuantity={false}
                onQuantityChange={jest.fn()}
                onOpenHistory={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        expect(screen.getByText("Carrot")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("kg")).toBeInTheDocument();
    });

    it("should render the allergens value as-is (the API sends a single string, not a list)", () => {
        render(
            <IngredientCard
                ingredient={{ ...BASE_INGREDIENT, allergens: "Dairy" }}
                isEditingQuantity={false}
                onQuantityChange={jest.fn()}
                onOpenHistory={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        expect(screen.getByText("Dairy")).toBeInTheDocument();
    });

    it("should show a dash when there are no allergens", () => {
        render(
            <IngredientCard
                ingredient={{ ...BASE_INGREDIENT, allergens: null }}
                isEditingQuantity={false}
                onQuantityChange={jest.fn()}
                onOpenHistory={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("should show a 'No expiry' badge when there is no shelf-life data", () => {
        render(
            <IngredientCard
                ingredient={BASE_INGREDIENT}
                isEditingQuantity={false}
                onQuantityChange={jest.fn()}
                onOpenHistory={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        expect(screen.getByText("No expiry")).toBeInTheDocument();
    });

    it("should show an 'Expired' badge for an ingredient past its shelf life", () => {
        render(
            <IngredientCard
                ingredient={{
                    ...BASE_INGREDIENT,
                    days_to_expire: 1,
                    purchase_date: "2000-01-01",
                }}
                isEditingQuantity={false}
                onQuantityChange={jest.fn()}
                onOpenHistory={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        expect(screen.getByText("Expired")).toBeInTheDocument();
    });

    it("should call onOpenHistory when Details is clicked", async () => {
        const onOpenHistory = jest.fn();

        render(
            <IngredientCard
                ingredient={BASE_INGREDIENT}
                isEditingQuantity={false}
                onQuantityChange={jest.fn()}
                onOpenHistory={onOpenHistory}
                onDelete={jest.fn()}
            />,
        );

        await userEvent.click(screen.getByText("Details"));

        expect(onOpenHistory).toHaveBeenCalledWith(BASE_INGREDIENT);
    });

    it("should call onDelete when the delete button is clicked", async () => {
        const onDelete = jest.fn();

        render(
            <IngredientCard
                ingredient={BASE_INGREDIENT}
                isEditingQuantity={false}
                onQuantityChange={jest.fn()}
                onOpenHistory={jest.fn()}
                onDelete={onDelete}
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Delete" }));

        expect(onDelete).toHaveBeenCalledWith(BASE_INGREDIENT);
    });

    it("should show a quantity input instead of delete when editing quantity", async () => {
        const onQuantityChange = jest.fn();

        render(
            <IngredientCard
                ingredient={BASE_INGREDIENT}
                isEditingQuantity={true}
                onQuantityChange={onQuantityChange}
                onOpenHistory={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        expect(
            screen.queryByRole("button", { name: "Delete" }),
        ).not.toBeInTheDocument();

        await userEvent.type(screen.getByRole("spinbutton"), "5");

        expect(onQuantityChange).toHaveBeenCalledWith(1, 35);
    });
});
