import type { FilterDef } from "utils/filters/filterDef";
import { idListFilter, textFilter } from "utils/filters/filterDefFactories";
import { booleanFilter } from "utils/filters/filterDefFactories.scalar";
import {
    activeDefs,
    buildParams,
    readState,
    resetState,
    writeState,
} from "utils/filters/filterState";

interface TestParams {
    q?: string;
    type_ids?: string;
    in_stock?: boolean;
}

const DEFS: readonly FilterDef<unknown, TestParams>[] = [
    textFilter<TestParams>({ key: "search", urlParam: "q" }),
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

describe("readState", () => {
    it("should build a state object from the URL using each def's default when absent", () => {
        const state = readState<TestParams>(DEFS, new URLSearchParams());

        expect(state).toEqual({ search: "", types: [], inStock: false });
    });

    it("should read every def's current value from the URL", () => {
        const state = readState<TestParams>(
            DEFS,
            new URLSearchParams("q=milk&types=1,2&stock=1"),
        );

        expect(state).toEqual({
            search: "milk",
            types: [1, 2],
            inStock: true,
        });
    });
});

describe("writeState", () => {
    it("should write every def's value into a copy of the current params", () => {
        const state = { search: "milk", types: [1], inStock: true };
        const next = writeState<TestParams>(
            DEFS,
            state,
            new URLSearchParams("unrelated=kept"),
        );

        expect(next.get("q")).toBe("milk");
        expect(next.get("types")).toBe("1");
        expect(next.get("stock")).toBe("1");
        expect(next.get("unrelated")).toBe("kept");
    });

    it("should clear a def's URL key when its value is back to default", () => {
        const state = { search: "", types: [], inStock: false };
        const next = writeState<TestParams>(
            DEFS,
            state,
            new URLSearchParams("q=milk&types=1&stock=1"),
        );

        expect(next.has("q")).toBe(false);
        expect(next.has("types")).toBe(false);
        expect(next.has("stock")).toBe(false);
    });
});

describe("buildParams", () => {
    it("should return no request params when nothing is active", () => {
        const state = { search: "", types: [], inStock: false };

        expect(buildParams<TestParams>(DEFS, state)).toEqual({});
    });

    it("should merge every active def's request params, skipping the text filter", () => {
        const state = { search: "milk", types: [1, 2], inStock: true };

        expect(buildParams<TestParams>(DEFS, state)).toEqual({
            type_ids: "1,2",
            in_stock: true,
        });
    });
});

describe("activeDefs", () => {
    it("should return only the defs whose current value is active", () => {
        const state = { search: "", types: [1], inStock: false };
        const active = activeDefs<TestParams>(DEFS, state);

        expect(active).toHaveLength(1);
        expect(active[0].def.key).toBe("types");
        expect(active[0].value).toEqual([1]);
    });
});

describe("resetState", () => {
    it("should return every def's default value", () => {
        expect(resetState<TestParams>(DEFS)).toEqual({
            search: "",
            types: [],
            inStock: false,
        });
    });
});
