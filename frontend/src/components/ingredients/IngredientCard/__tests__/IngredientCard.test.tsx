import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MS_PER_DAY } from "constants/time";
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
    lots: [],
};

describe("IngredientCard", () => {
    it("should render the name, quantity and unit", () => {
        render(
            <IngredientCard
                ingredient={BASE_INGREDIENT}
                onOpenHistory={jest.fn()}
                onRestock={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        expect(screen.getByText("Carrot")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("kg")).toBeInTheDocument();
    });

    it("should name the card after the ingredient", () => {
        render(
            <IngredientCard
                ingredient={BASE_INGREDIENT}
                onOpenHistory={jest.fn()}
                onRestock={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        expect(
            screen.getByRole("article", { name: "Carrot" }),
        ).toBeInTheDocument();
    });

    it("should render the allergens list joined by comma", () => {
        render(
            <IngredientCard
                ingredient={{
                    ...BASE_INGREDIENT,
                    allergens: ["milk", "gluten"],
                }}
                onOpenHistory={jest.fn()}
                onRestock={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        expect(screen.getByText("Milk, Gluten")).toBeInTheDocument();
    });

    it("should show a dash when there are no allergens", () => {
        render(
            <IngredientCard
                ingredient={{ ...BASE_INGREDIENT, allergens: [] }}
                onOpenHistory={jest.fn()}
                onRestock={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("should show a 'No expiry' badge when there is no shelf-life data", () => {
        render(
            <IngredientCard
                ingredient={BASE_INGREDIENT}
                onOpenHistory={jest.fn()}
                onRestock={jest.fn()}
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
                    lots: [
                        { id: 105, quantity: 3, purchase_date: "2000-01-01" },
                    ],
                }}
                onOpenHistory={jest.fn()}
                onRestock={jest.fn()}
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
                onOpenHistory={onOpenHistory}
                onRestock={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        await userEvent.click(screen.getByText("Details"));

        expect(onOpenHistory).toHaveBeenCalledWith(BASE_INGREDIENT);
    });

    it("should count the days left on the badge of an ingredient expiring soon", () => {
        render(
            <IngredientCard
                ingredient={{
                    ...BASE_INGREDIENT,
                    days_to_expire: 4,
                    lots: [
                        {
                            id: 102,
                            quantity: 3,
                            purchase_date: new Date(
                                Date.now() - MS_PER_DAY,
                            ).toISOString(),
                        },
                    ],
                }}
                onOpenHistory={jest.fn()}
                onRestock={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        // bought yesterday with a 4-day shelf life, so 3 days are left
        expect(screen.getByText("3 days")).toBeInTheDocument();
    });

    it("should show a 'Fresh' badge for an ingredient well within its shelf life", () => {
        render(
            <IngredientCard
                ingredient={{
                    ...BASE_INGREDIENT,
                    days_to_expire: 30,
                    lots: [
                        {
                            id: 101,
                            quantity: 3,
                            purchase_date: new Date().toISOString(),
                        },
                    ],
                }}
                onOpenHistory={jest.fn()}
                onRestock={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        expect(screen.getByText("Fresh")).toBeInTheDocument();
    });
});
