import { act, renderHook } from "@testing-library/react";

import type { Ingredient } from "types/ingredient";

import { useCategorizedIngredients } from "hooks/useCategorizedIngredients";

const INGREDIENTS: Ingredient[] = [
    {
        id: 1,
        slug: "potato",
        name: "Potato",
        category: "vegetables",
        unit_name: "g",
        allergens: [],
        days_to_expire: 30,
        calories_per_unit: null,
    },
    {
        id: 2,
        slug: "onion",
        name: "Onion",
        category: "vegetables",
        unit_name: "g",
        allergens: [],
        days_to_expire: 30,
        calories_per_unit: null,
    },
    {
        id: 3,
        slug: "salmon",
        name: "Salmon",
        category: "fish",
        unit_name: "g",
        allergens: ["fish"],
        days_to_expire: 2,
        calories_per_unit: null,
    },
    {
        id: 4,
        slug: "beef",
        name: "Beef",
        category: "meat",
        unit_name: "g",
        allergens: [],
        days_to_expire: 5,
        calories_per_unit: null,
    },
    {
        id: 5,
        slug: "bacon",
        name: "Bacon",
        category: "meat",
        unit_name: "g",
        allergens: [],
        days_to_expire: 10,
        calories_per_unit: null,
    },
];

describe("useCategorizedIngredients", () => {
    it("should show no ingredients before a query or category is chosen", () => {
        const { result } = renderHook(() =>
            useCategorizedIngredients({
                ingredients: INGREDIENTS,
                maxSearchResults: 8,
            }),
        );

        expect(result.current.visibleIngredients).toEqual([]);
        expect(result.current.categories).toEqual([
            { key: "vegetables", label: "Vegetables", count: 2 },
            { key: "meat", label: "Meat", count: 2 },
            { key: "fish", label: "Fish", count: 1 },
        ]);
    });

    it("should search by name across all categories when a query is set", () => {
        const { result } = renderHook(() =>
            useCategorizedIngredients({
                ingredients: INGREDIENTS,
                maxSearchResults: 8,
            }),
        );

        act(() => {
            result.current.setQuery("oni");
        });

        expect(result.current.visibleIngredients.map((i) => i.slug)).toEqual([
            "onion",
        ]);
    });

    it("should list only the active category's ingredients, sorted by name, when no query is set", () => {
        const { result } = renderHook(() =>
            useCategorizedIngredients({
                ingredients: INGREDIENTS,
                maxSearchResults: 8,
            }),
        );

        act(() => {
            result.current.setActiveCategory("vegetables");
        });

        expect(result.current.visibleIngredients.map((i) => i.slug)).toEqual([
            "onion",
            "potato",
        ]);
    });

    it("should rank name matches that start with the query before ones that only contain it", () => {
        const { result } = renderHook(() =>
            useCategorizedIngredients({
                ingredients: INGREDIENTS,
                maxSearchResults: 8,
            }),
        );

        act(() => {
            result.current.setQuery("on");
        });

        // "Onion" starts with "on", "Bacon" and "Salmon" only contain it
        expect(result.current.visibleIngredients.map((i) => i.slug)).toEqual([
            "onion",
            "bacon",
            "salmon",
        ]);
    });

    it("should fall back to a matching category's ingredients when the query names a category", () => {
        const { result } = renderHook(() =>
            useCategorizedIngredients({
                ingredients: INGREDIENTS,
                maxSearchResults: 8,
            }),
        );

        act(() => {
            result.current.setQuery("meat");
        });

        // no ingredient name contains "meat", so the whole Meat category is offered instead
        expect(result.current.visibleIngredients.map((i) => i.slug)).toEqual([
            "bacon",
            "beef",
        ]);
    });

    it("should list a name match before the rest of its own matching category", () => {
        const withMeatballs: Ingredient[] = [
            ...INGREDIENTS,
            {
                id: 6,
                slug: "meatballs",
                name: "Meatballs",
                category: "meat",
                unit_name: "piece",
                allergens: [],
                days_to_expire: 3,
                calories_per_unit: null,
            },
        ];

        const { result } = renderHook(() =>
            useCategorizedIngredients({
                ingredients: withMeatballs,
                maxSearchResults: 8,
            }),
        );

        act(() => {
            result.current.setQuery("meat");
        });

        // "Meatballs" matches by name; "Beef" and "Bacon" only match through the Meat category
        expect(result.current.visibleIngredients.map((i) => i.slug)).toEqual([
            "meatballs",
            "bacon",
            "beef",
        ]);
    });

    it("should drop the active category once it no longer has any ingredients", () => {
        const { result, rerender } = renderHook(
            (props: { ingredients: Ingredient[] }) =>
                useCategorizedIngredients({
                    ingredients: props.ingredients,
                    maxSearchResults: 8,
                }),
            { initialProps: { ingredients: INGREDIENTS } },
        );

        act(() => {
            result.current.setActiveCategory("fish");
        });

        expect(result.current.activeCategory).toBe("fish");

        // "salmon" (the only fish ingredient) just got picked and is no longer offerable
        rerender({
            ingredients: INGREDIENTS.filter((i) => i.slug !== "salmon"),
        });

        expect(result.current.activeCategory).toBeNull();
    });

    it("should prefer the search query over an active category", () => {
        const { result } = renderHook(() =>
            useCategorizedIngredients({
                ingredients: INGREDIENTS,
                maxSearchResults: 8,
            }),
        );

        act(() => {
            result.current.setActiveCategory("vegetables");
            result.current.setQuery("salmon");
        });

        expect(result.current.visibleIngredients.map((i) => i.slug)).toEqual([
            "salmon",
        ]);
    });
});
