import { act, renderHook } from "@testing-library/react";

import { useClientFilters } from "hooks/useClientFilters";

import type { ClientFilterDef } from "utils/filters/clientFilterDef";

interface Item {
    name: string;
    category: string;
}

interface TestState {
    query: string;
    category: string | null;
}

const ITEMS: Item[] = [
    { name: "Potato", category: "vegetables" },
    { name: "Onion", category: "vegetables" },
    { name: "Salmon", category: "fish" },
];

const DEFS: readonly ClientFilterDef<Item, unknown>[] = [
    {
        key: "query",
        defaultValue: "",
        isActive: (value) => value !== "",
        predicate: (item, value) =>
            item.name.toLowerCase().includes((value as string).toLowerCase()),
    },
    {
        key: "category",
        defaultValue: null,
        isActive: (value) => value !== null,
        predicate: (item, value) => item.category === value,
    },
];

const setup = () =>
    renderHook(() => useClientFilters<Item, TestState>(DEFS, ITEMS));

describe("useClientFilters", () => {
    it("should return every item and no active filters by default", () => {
        const { result } = setup();

        expect(result.current.values).toEqual({ query: "", category: null });
        expect(result.current.visibleItems).toEqual(ITEMS);
        expect(result.current.hasActiveFilters).toBe(false);
        expect(result.current.activeCount).toBe(0);
    });

    it("should filter visibleItems by a single active predicate", () => {
        const { result } = setup();

        act(() => {
            result.current.setValue("query", "oni");
        });

        expect(result.current.visibleItems.map((item) => item.name)).toEqual([
            "Onion",
        ]);
        expect(result.current.activeCount).toBe(1);
    });

    it("should AND every active filter together", () => {
        const { result } = setup();

        act(() => {
            result.current.setValue("query", "o");
            result.current.setValue("category", "vegetables");
        });

        expect(result.current.visibleItems.map((item) => item.name)).toEqual([
            "Potato",
            "Onion",
        ]);
        expect(result.current.activeCount).toBe(2);
    });

    it("should reset every filter back to its default", () => {
        const { result } = setup();

        act(() => {
            result.current.setValue("query", "salmon");
        });
        act(() => {
            result.current.reset();
        });

        expect(result.current.values).toEqual({ query: "", category: null });
        expect(result.current.visibleItems).toEqual(ITEMS);
    });
});
