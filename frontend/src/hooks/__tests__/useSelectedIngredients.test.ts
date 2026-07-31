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

    it("should do nothing when removing an id that isn't selected", () => {
        const { result } = renderHook(() => useSelectedIngredients());

        act(() => {
            result.current.toggleIngredientSelection(ING_A);
        });

        act(() => {
            result.current.removeIngredient(999);
        });

        expect(idsOf(result.current.selectedIngredients)).toEqual([ING_A.id]);
    });

    // the dragged ingredient always ends up immediately before the drop target - moving it
    // forward past other rows must land it there too, not one slot further (a splice-based
    // reorder has to adjust the target index for the shift caused by removing the dragged item)
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

    it("should move an ingredient to land right before a target further up the list", () => {
        const { result } = renderHook(() => useSelectedIngredients());

        act(() => {
            result.current.toggleIngredientSelection(ING_A);
            result.current.toggleIngredientSelection(ING_B);
            result.current.toggleIngredientSelection(ING_C);
            result.current.toggleIngredientSelection(ING_D);
        });

        act(() => {
            result.current.reorderIngredients(ING_D.id, ING_A.id);
        });

        expect(idsOf(result.current.selectedIngredients)).toEqual([
            ING_D.id,
            ING_A.id,
            ING_B.id,
            ING_C.id,
        ]);
    });

    it("should do nothing when reordering an unknown id", () => {
        const { result } = renderHook(() => useSelectedIngredients());

        act(() => {
            result.current.toggleIngredientSelection(ING_A);
            result.current.toggleIngredientSelection(ING_B);
        });

        act(() => {
            result.current.reorderIngredients(999, ING_B.id);
        });

        expect(idsOf(result.current.selectedIngredients)).toEqual([
            ING_A.id,
            ING_B.id,
        ]);
    });
});
