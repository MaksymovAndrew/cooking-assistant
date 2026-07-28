import { render, screen } from "@testing-library/react";

import type { PantryIngredient } from "types/userIngredient";

import { IngredientGrid } from "components/ingredients/IngredientGrid";

const INGREDIENTS: PantryIngredient[] = [
    {
        id: 1,
        slug: "carrot",
        ingredient_name: "Carrot",
        category: "vegetables",
        unit_name: "kg",
        quantity_person_ingradient: 2,
        allergens: [],
    },
    {
        id: 2,
        slug: "onion",
        ingredient_name: "Onion",
        category: "vegetables",
        unit_name: "kg",
        quantity_person_ingradient: 1,
        allergens: [],
    },
];

describe("IngredientGrid", () => {
    it("should render a card per ingredient", () => {
        render(
            <IngredientGrid
                ingredients={INGREDIENTS}
                emptyMessage="No ingredients"
                isEditingQuantity={false}
                onQuantityChange={jest.fn()}
                onSaveQuantity={jest.fn()}
                onOpenHistory={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        expect(screen.getByText("Carrot")).toBeInTheDocument();
        expect(screen.getByText("Onion")).toBeInTheDocument();
    });

    it("should show the empty message instead of cards when there are no ingredients", () => {
        render(
            <IngredientGrid
                ingredients={[]}
                emptyMessage="No ingredients"
                isEditingQuantity={false}
                onQuantityChange={jest.fn()}
                onSaveQuantity={jest.fn()}
                onOpenHistory={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        expect(screen.getByText("No ingredients")).toBeInTheDocument();
        expect(screen.queryByText("Carrot")).not.toBeInTheDocument();
    });
});
