import { act, renderHook } from "@testing-library/react";

import { useSelectedIngredients } from "hooks/useSelectedIngredients";

const ING_A = {
    id: 1,
    slug: "potato",
    name: "Potato",
    category: "vegetables",
    unit_name: "kg",
    allergens: [],
    days_to_expire: 30,
    calories_per_unit: null,
};
const ING_B = {
    id: 2,
    slug: "carrot",
    name: "Carrot",
    category: "vegetables",
    unit_name: "g",
    allergens: [],
    days_to_expire: 14,
    calories_per_unit: null,
};
const ING_C = {
    id: 3,
    slug: "onion",
    name: "Onion",
    category: "vegetables",
    unit_name: "g",
    allergens: [],
    days_to_expire: 20,
    calories_per_unit: null,
};
const ING_D = {
    id: 4,
    slug: "garlic",
    name: "Garlic",
    category: "vegetables",
    unit_name: "g",
    allergens: [],
    days_to_expire: 60,
    calories_per_unit: null,
};

const idsOf = (ingredients: { id: number }[]) => ingredients.map((i) => i.id);

describe("useSelectedIngredients", () => {
    it("should add ingredient with quantity 1 when toggled in", () => {
        const { result } = renderHook(() => useSelectedIngredients());

        act(() => {
            result.current.toggleIngredientSelection(ING_A);
        });

        expect(result.current.selectedIngredients).toHaveLength(1);
        expect(result.current.selectedIngredients[0].id).toBe(ING_A.id);
        expect(result.current.selectedIngredients[0].quantity).toBe(1);
    });

    it("should remove ingredient when toggled twice", () => {
        const { result } = renderHook(() => useSelectedIngredients());

        act(() => {
            result.current.toggleIngredientSelection(ING_A);
        });

        act(() => {
            result.current.toggleIngredientSelection(ING_A);
        });

        expect(result.current.selectedIngredients).toHaveLength(0);
    });

    it("should update quantity for an existing ingredient", () => {
        const { result } = renderHook(() => useSelectedIngredients());

        act(() => {
            result.current.toggleIngredientSelection(ING_A);
        });

        act(() => {
            result.current.updateIngredientQuantity(ING_A.id, 5);
        });

        expect(
            result.current.selectedIngredients.find((i) => i.id === ING_A.id)
                ?.quantity,
        ).toBe(5);
    });

    it.each([0, -3])(
        "should clamp quantity to minimum 1 when %p is passed",
        (quantity) => {
            const { result } = renderHook(() => useSelectedIngredients());

            act(() => {
                result.current.toggleIngredientSelection(ING_A);
            });

            act(() => {
                result.current.updateIngredientQuantity(ING_A.id, quantity);
            });

            expect(
                result.current.selectedIngredients.find(
                    (i) => i.id === ING_A.id,
                )?.quantity,
            ).toBe(1);
        },
    );

    it("should preserve other ingredients when updating one quantity", () => {
        const { result } = renderHook(() => useSelectedIngredients());

        act(() => {
            result.current.toggleIngredientSelection(ING_A);
            result.current.toggleIngredientSelection(ING_B);
        });

        act(() => {
            result.current.updateIngredientQuantity(ING_A.id, 10);
        });

        const b = result.current.selectedIngredients.find(
            (i) => i.id === ING_B.id,
        );

        expect(b?.quantity).toBe(1);
    });

    it("should remove only the targeted ingredient", () => {
        const { result } = renderHook(() => useSelectedIngredients());

        act(() => {
            result.current.toggleIngredientSelection(ING_A);
            result.current.toggleIngredientSelection(ING_B);
        });

        act(() => {
            result.current.removeIngredient(ING_A.id);
        });

        expect(idsOf(result.current.selectedIngredients)).toEqual([ING_B.id]);
    });

    // a splice-based reorder must shift the target index for the removed dragged item
    it("should move an ingredient to land right before a target further down the list", () => {
        const { result } = renderHook(() => useSelectedIngredients());

        act(() => {
            result.current.toggleIngredientSelection(ING_A);
            result.current.toggleIngredientSelection(ING_B);
            result.current.toggleIngredientSelection(ING_C);
            result.current.toggleIngredientSelection(ING_D);
        });

        act(() => {
            result.current.reorderIngredients(ING_A.id, ING_D.id);
        });

        expect(idsOf(result.current.selectedIngredients)).toEqual([
            ING_B.id,
            ING_C.id,
            ING_A.id,
            ING_D.id,
        ]);
    });
});
