import { renderHook } from "@testing-library/react";

import { useIngredientCategories } from "hooks/useIngredientCategories";

describe("useIngredientCategories", () => {
    it("should count ingredients per category", () => {
        const { result } = renderHook(() =>
            useIngredientCategories([
                { category: "vegetables" },
                { category: "vegetables" },
                { category: "fish" },
            ]),
        );

        expect(result.current).toEqual([
            { key: "vegetables", label: "Vegetables", count: 2 },
            { key: "fish", label: "Fish", count: 1 },
        ]);
    });

    it("should return categories in the catalog's canonical order regardless of input order", () => {
        const { result } = renderHook(() =>
            useIngredientCategories([
                { category: "fish" },
                { category: "vegetables" },
            ]),
        );

        expect(result.current.map((category) => category.key)).toEqual([
            "vegetables",
            "fish",
        ]);
    });

    it("should return an empty list when given no ingredients", () => {
        const { result } = renderHook(() => useIngredientCategories([]));

        expect(result.current).toEqual([]);
    });
});
