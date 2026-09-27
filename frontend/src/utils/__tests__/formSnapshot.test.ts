import { differsFromSnapshot } from "utils/formSnapshot";

describe("differsFromSnapshot", () => {
    it("should treat the same values in a different key order as unchanged", () => {
        expect(
            differsFromSnapshot(
                { title: "Soup", language: "en" },
                { language: "en", title: "Soup" },
            ),
        ).toBe(false);
    });

    it("should report a changed value", () => {
        expect(
            differsFromSnapshot(
                { title: "Soup", language: "pl" },
                { language: "en", title: "Soup" },
            ),
        ).toBe(true);
    });

    it("should compare nested lists by content", () => {
        expect(differsFromSnapshot({ ids: [1, 2] }, { ids: [1, 2] })).toBe(
            false,
        );
        expect(differsFromSnapshot({ ids: [1, 2] }, { ids: [2, 1] })).toBe(
            true,
        );
    });
});
