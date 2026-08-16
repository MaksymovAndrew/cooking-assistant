import { act, renderHook } from "@testing-library/react";

import type { PantryIngredient } from "types/userIngredient";

import { usePantryFilters } from "hooks/usePantryFilters";

const SALMON: PantryIngredient = {
    id: 1,
    slug: "salmon",
    ingredient_name: "Salmon",
    category: "fish",
    unit_name: "g",
    quantity_person_ingradient: 1,
    allergens: [],
    lots: [],
};
const CARROT: PantryIngredient = {
    id: 2,
    slug: "carrot",
    ingredient_name: "Carrot",
    category: "vegetables",
    unit_name: "g",
    quantity_person_ingradient: 1,
    allergens: [],
    lots: [],
};

describe("usePantryFilters", () => {
    it("should filter visibleIngredients by the resolved ingredient name", () => {
        const { result } = renderHook(() =>
            usePantryFilters({
                personIngredients: [SALMON, CARROT],
            }),
        );

        act(() => {
            result.current.setQuery("carrot");
        });

        expect(result.current.visibleIngredients.map((i) => i.slug)).toEqual([
            "carrot",
        ]);
    });

    it("should drop the category filter once the pantry no longer has that category", () => {
        const { result, rerender } = renderHook(
            (props: { personIngredients: PantryIngredient[] }) =>
                usePantryFilters({
                    personIngredients: props.personIngredients,
                }),
            { initialProps: { personIngredients: [SALMON, CARROT] } },
        );

        act(() => {
            result.current.setCategoryFilter("fish");
        });

        expect(result.current.categoryFilter).toBe("fish");

        // the only fish ingredient was just deleted from the pantry
        rerender({ personIngredients: [CARROT] });

        expect(result.current.categoryFilter).toBeNull();
    });
});
