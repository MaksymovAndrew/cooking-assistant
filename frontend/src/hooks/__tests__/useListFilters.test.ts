import { act } from "@testing-library/react";

import { useListFilters } from "hooks/useListFilters";

import type { FilterDef } from "utils/filters/filterDef";
import { idListFilter, textFilter } from "utils/filters/filterDefFactories";
import { booleanFilter } from "utils/filters/filterDefFactories.scalar";

import { renderHookWithRouter } from "test/store";

interface TestState {
    search: string;
    types: number[];
    inStock: boolean;
}

interface TestParams {
    q?: string;
    type_ids?: string;
    in_stock?: boolean;
}

const DEFS: readonly FilterDef<unknown, TestParams>[] = [
    textFilter<TestParams>({
        key: "search",
        urlParam: "q",
        chipLabel: (value) => `“${value}”`,
    }),
    idListFilter<TestParams>({
        key: "types",
        urlParam: "types",
        param: "type_ids",
    }),
    booleanFilter<TestParams>({
        key: "inStock",
        urlParam: "stock",
        param: "in_stock",
    }),
];

const setup = (initialEntries = ["/test"]) =>
    renderHookWithRouter(() => useListFilters<TestState, TestParams>(DEFS), {
        initialEntries,
    });

describe("useListFilters", () => {
    it("should read defaults and produce no request params when the URL has no filters", () => {
        const { result } = setup();

        expect(result.current.values).toEqual({
            search: "",
            types: [],
            inStock: false,
        });
        expect(result.current.params).toEqual({});
        expect(result.current.hasActiveFilters).toBe(false);
        expect(result.current.activeCount).toBe(0);
    });

    it("should read existing URL params into values and params", () => {
        const { result } = setup(["/test?q=milk&types=1,2&stock=1"]);

        expect(result.current.values).toEqual({
            search: "milk",
            types: [1, 2],
            inStock: true,
        });
        expect(result.current.params).toEqual({
            type_ids: "1,2",
            in_stock: true,
        });
        expect(result.current.activeCount).toBe(3);
    });

    it("should update the URL-backed value when setValue is called", () => {
        const { result } = setup();

        act(() => {
            result.current.setValue("types", [3]);
        });

        expect(result.current.values.types).toEqual([3]);
        expect(result.current.params).toEqual({ type_ids: "3" });
    });

    it("should reset every filter back to its default", () => {
        const { result } = setup(["/test?q=milk&types=1&stock=1"]);

        act(() => {
            result.current.reset();
        });

        expect(result.current.values).toEqual({
            search: "",
            types: [],
            inStock: false,
        });
        expect(result.current.hasActiveFilters).toBe(false);
    });

    it("should clear only the removed filter when an active entry's remove() is called", () => {
        const { result } = setup(["/test?q=milk&types=1"]);

        const searchEntry = result.current.activeFilters.find(
            (entry) => entry.def.key === "search",
        );

        act(() => {
            searchEntry?.remove();
        });

        expect(result.current.values).toEqual({
            search: "",
            types: [1],
            inStock: false,
        });
    });
});
