import {
    idListFilter,
    numericRangeFilter,
    textFilter,
} from "utils/filters/filterDefFactories";
import {
    booleanFilter,
    enumFilter,
} from "utils/filters/filterDefFactories.scalar";

interface TestParams {
    q?: string;
    ids?: string;
    min_val?: string;
    max_val?: string;
    flag?: boolean;
    sort_by?: "asc" | "desc";
}

describe("textFilter", () => {
    const def = textFilter<TestParams>({ key: "search", urlParam: "q" });

    it("should read an empty string when the URL key is absent", () => {
        expect(def.read(new URLSearchParams())).toBe("");
    });

    it("should read the URL value", () => {
        expect(def.read(new URLSearchParams("q=milk"))).toBe("milk");
    });

    it("should write the value and delete the key when cleared", () => {
        const params = new URLSearchParams();

        def.write(params, "milk");
        expect(params.get("q")).toBe("milk");

        def.write(params, "");
        expect(params.has("q")).toBe(false);
    });

    it("should never contribute request params on its own", () => {
        expect(def.toParams("milk")).toEqual({});
    });

    it("should be active only when non-empty", () => {
        expect(def.isActive("")).toBe(false);
        expect(def.isActive("milk")).toBe(true);
    });
});

describe("idListFilter", () => {
    const def = idListFilter<TestParams>({
        key: "types",
        urlParam: "types",
        param: "ids",
    });

    it("should read an empty array when the URL key is absent", () => {
        expect(def.read(new URLSearchParams())).toEqual([]);
    });

    it("should parse a comma-separated id list", () => {
        expect(def.read(new URLSearchParams("types=1,2,3"))).toEqual([1, 2, 3]);
    });

    it("should write a comma-joined list and delete the key when empty", () => {
        const params = new URLSearchParams();

        def.write(params, [1, 2]);
        expect(params.get("types")).toBe("1,2");

        def.write(params, []);
        expect(params.has("types")).toBe(false);
    });

    it("should map to the request param as a comma-joined string", () => {
        expect(def.toParams([1, 2])).toEqual({ ids: "1,2" });
        expect(def.toParams([])).toEqual({});
    });

    it("should be active only when non-empty", () => {
        expect(def.isActive([])).toBe(false);
        expect(def.isActive([1])).toBe(true);
    });
});

describe("numericRangeFilter", () => {
    const def = numericRangeFilter<TestParams>({
        key: "range",
        urlParam: "val",
        minParam: "min_val",
        maxParam: "max_val",
    });

    it("should read both bounds from the val_min/val_max URL keys", () => {
        expect(def.read(new URLSearchParams("val_min=10&val_max=60"))).toEqual({
            min: "10",
            max: "60",
        });
    });

    it("should default missing bounds to an empty string", () => {
        expect(def.read(new URLSearchParams())).toEqual({ min: "", max: "" });
    });

    it("should write only the bounds that are set", () => {
        const params = new URLSearchParams();

        def.write(params, { min: "10", max: "" });
        expect(params.get("val_min")).toBe("10");
        expect(params.has("val_max")).toBe(false);
    });

    it("should map only the set bounds to request params", () => {
        expect(def.toParams({ min: "10", max: "" })).toEqual({
            min_val: "10",
        });
        expect(def.toParams({ min: "", max: "" })).toEqual({});
    });

    it("should be active when either bound is set", () => {
        expect(def.isActive({ min: "", max: "" })).toBe(false);
        expect(def.isActive({ min: "10", max: "" })).toBe(true);
        expect(def.isActive({ min: "", max: "60" })).toBe(true);
    });
});

describe("booleanFilter", () => {
    const def = booleanFilter<TestParams>({
        key: "flag",
        urlParam: "flag",
        param: "flag",
    });

    it("should read false when the URL key is absent", () => {
        expect(def.read(new URLSearchParams())).toBe(false);
    });

    it("should read true only for the exact truthy URL value", () => {
        expect(def.read(new URLSearchParams("flag=1"))).toBe(true);
        expect(def.read(new URLSearchParams("flag=true"))).toBe(false);
    });

    it("should write the key only when true", () => {
        const params = new URLSearchParams();

        def.write(params, true);
        expect(params.get("flag")).toBe("1");

        def.write(params, false);
        expect(params.has("flag")).toBe(false);
    });

    it("should map to the request param only when true", () => {
        expect(def.toParams(true)).toEqual({ flag: true });
        expect(def.toParams(false)).toEqual({});
    });
});

describe("enumFilter", () => {
    const def = enumFilter<"asc" | "desc", TestParams>({
        key: "sort",
        urlParam: "sort",
        param: "sort_by",
        values: ["asc", "desc"],
    });

    it("should read null when the URL key is absent or invalid", () => {
        expect(def.read(new URLSearchParams())).toBeNull();
        expect(def.read(new URLSearchParams("sort=junk"))).toBeNull();
    });

    it("should read a valid enum value", () => {
        expect(def.read(new URLSearchParams("sort=desc"))).toBe("desc");
    });

    it("should write the value and delete the key when null", () => {
        const params = new URLSearchParams();

        def.write(params, "asc");
        expect(params.get("sort")).toBe("asc");

        def.write(params, null);
        expect(params.has("sort")).toBe(false);
    });

    it("should map to the request param only when set", () => {
        expect(def.toParams("desc")).toEqual({ sort_by: "desc" });
        expect(def.toParams(null)).toEqual({});
    });

    it("should be active only when set", () => {
        expect(def.isActive(null)).toBe(false);
        expect(def.isActive("asc")).toBe(true);
    });
});
