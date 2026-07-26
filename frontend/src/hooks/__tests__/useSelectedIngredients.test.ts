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

describe("useSelectedIngredients", () => {
    it("should start with empty selection", () => {
        const { result } = renderHook(() => useSelectedIngredients());

        expect(result.current.selectedIngredients).toHaveLength(0);
    });

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

    it("should not add duplicate ingredient on repeated toggle-in", () => {
        const { result } = renderHook(() => useSelectedIngredients());

        act(() => {
            result.current.toggleIngredientSelection(ING_A);
            result.current.toggleIngredientSelection(ING_A);
            result.current.toggleIngredientSelection(ING_A);
        });

        expect(result.current.selectedIngredients.length).toBeLessThanOrEqual(
            1,
        );
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

    it("should clamp quantity to minimum 1 when zero is passed", () => {
        const { result } = renderHook(() => useSelectedIngredients());

        act(() => {
            result.current.toggleIngredientSelection(ING_A);
        });

        act(() => {
            result.current.updateIngredientQuantity(ING_A.id, 0);
        });

        expect(
            result.current.selectedIngredients.find((i) => i.id === ING_A.id)
                ?.quantity,
        ).toBe(1);
    });

    it("should clamp quantity to minimum 1 when negative is passed", () => {
        const { result } = renderHook(() => useSelectedIngredients());

        act(() => {
            result.current.toggleIngredientSelection(ING_A);
        });

        act(() => {
            result.current.updateIngredientQuantity(ING_A.id, -3);
        });

        expect(
            result.current.selectedIngredients.find((i) => i.id === ING_A.id)
                ?.quantity,
        ).toBe(1);
    });

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
});
