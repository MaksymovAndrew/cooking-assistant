import { moveBefore, toggleValue } from "utils/listOrder";

describe("moveBefore", () => {
    it("should move an item forward to just before the drop target", () => {
        expect(moveBefore(["a", "b", "c", "d"], 0, 3)).toEqual([
            "b",
            "c",
            "a",
            "d",
        ]);
    });

    it("should move an item backward to just before the drop target", () => {
        expect(moveBefore(["a", "b", "c", "d"], 3, 1)).toEqual([
            "a",
            "d",
            "b",
            "c",
        ]);
    });

    it("should return the same list for a drop onto itself", () => {
        const list = ["a", "b"];

        expect(moveBefore(list, 1, 1)).toBe(list);
    });

    it("should return the same list for a missing index", () => {
        const list = ["a", "b"];

        expect(moveBefore(list, -1, 1)).toBe(list);
    });
});

describe("toggleValue", () => {
    it("should add a value the list lacks", () => {
        expect(toggleValue([1, 2], 3)).toEqual([1, 2, 3]);
    });

    it("should remove a value the list holds", () => {
        expect(toggleValue([1, 2, 3], 2)).toEqual([1, 3]);
    });
});
