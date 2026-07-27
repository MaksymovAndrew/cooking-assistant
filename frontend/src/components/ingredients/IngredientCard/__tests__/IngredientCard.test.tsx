import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { PantryIngredient } from "types/userIngredient";

import { IngredientCard } from "components/ingredients/IngredientCard";

const BASE_INGREDIENT: PantryIngredient = {
    id: 1,
    slug: "carrot",
    ingredient_name: "Carrot",
    category: "vegetables",
    unit_name: "kg",
    quantity_person_ingradient: 3,
    allergens: [],
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
                onSaveQuantity={jest.fn()}
                onOpenHistory={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        expect(screen.getByText("Carrot")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("kilogram")).toBeInTheDocument();
    });

    it("should render the allergens list joined by comma", () => {
        render(
            <IngredientCard
                ingredient={{
                    ...BASE_INGREDIENT,
                    allergens: ["milk", "gluten"],
                }}
                isEditingQuantity={false}
                onQuantityChange={jest.fn()}
                onSaveQuantity={jest.fn()}
                onOpenHistory={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        expect(screen.getByText("Milk, Gluten")).toBeInTheDocument();
    });

    it("should show a dash when there are no allergens", () => {
        render(
            <IngredientCard
                ingredient={{ ...BASE_INGREDIENT, allergens: [] }}
                isEditingQuantity={false}
                onQuantityChange={jest.fn()}
                onSaveQuantity={jest.fn()}
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
                onSaveQuantity={jest.fn()}
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
                onSaveQuantity={jest.fn()}
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
                onSaveQuantity={jest.fn()}
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
                onSaveQuantity={jest.fn()}
                onOpenHistory={jest.fn()}
                onDelete={onDelete}
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Delete" }));

        expect(onDelete).toHaveBeenCalledWith(BASE_INGREDIENT);
    });

    it("should show a quantity input and a Save button instead of Details/Delete when editing quantity", async () => {
        const onQuantityChange = jest.fn();

        render(
            <IngredientCard
                ingredient={BASE_INGREDIENT}
                isEditingQuantity={true}
                onQuantityChange={onQuantityChange}
                onSaveQuantity={jest.fn()}
                onOpenHistory={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        expect(
            screen.queryByRole("button", { name: "Delete" }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Details" }),
        ).not.toBeInTheDocument();

        await userEvent.type(screen.getByRole("spinbutton"), "5");

        expect(onQuantityChange).toHaveBeenCalledWith(1, 35);
    });

    it("should call onSaveQuantity with the ingredient's id when the card's Save button is clicked", async () => {
        const onSaveQuantity = jest.fn();

        render(
            <IngredientCard
                ingredient={BASE_INGREDIENT}
                isEditingQuantity={true}
                onQuantityChange={jest.fn()}
                onSaveQuantity={onSaveQuantity}
                onOpenHistory={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(onSaveQuantity).toHaveBeenCalledWith(1);
    });

    it("should show a Clock icon badge and an amber border for an ingredient expiring soon", () => {
        render(
            <IngredientCard
                ingredient={{
                    ...BASE_INGREDIENT,
                    days_to_expire: 3,
                    purchase_date: new Date().toISOString(),
                }}
                isEditingQuantity={false}
                onQuantityChange={jest.fn()}
                onSaveQuantity={jest.fn()}
                onOpenHistory={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        expect(screen.getAllByText("3 days")).toHaveLength(2);
    });

    it("should show a 'Fresh' badge for an ingredient well within its shelf life", () => {
        render(
            <IngredientCard
                ingredient={{
                    ...BASE_INGREDIENT,
                    days_to_expire: 30,
                    purchase_date: new Date().toISOString(),
                }}
                isEditingQuantity={false}
                onQuantityChange={jest.fn()}
                onSaveQuantity={jest.fn()}
                onOpenHistory={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        expect(screen.getByText("Fresh")).toBeInTheDocument();
    });
});
