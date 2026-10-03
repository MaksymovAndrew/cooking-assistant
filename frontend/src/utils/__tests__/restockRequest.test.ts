import type { PantryIngredient } from "types/userIngredient";

import { restockRequest } from "utils/restockRequest";

const INGREDIENT: PantryIngredient = {
    id: 7,
    slug: "flour",
    name: "Flour",
    category: "baking",
    unit_name: "kg",
    quantity_person_ingradient: 2,
    allergens: ["gluten"],
    lots: [],
};

describe("restockRequest", () => {
    it("should send the added amount for the one ingredient", () => {
        expect(restockRequest(INGREDIENT, 1.5)).toEqual({
            ingredients: [
                {
                    id: 7,
                    ingredient_name: "Flour",
                    quantity_person_ingradient: 1.5,
                },
            ],
        });
    });

    it("should prefer the pantry's own name field", () => {
        const [item] = restockRequest(
            { ...INGREDIENT, ingredient_name: "Wheat flour" },
            1,
        ).ingredients;

        expect(item.ingredient_name).toBe("Wheat flour");
    });

    it("should fall back to an empty name when the row carries none", () => {
        const [item] = restockRequest(
            { ...INGREDIENT, name: undefined },
            1,
        ).ingredients;

        expect(item.ingredient_name).toBe("");
    });
});
