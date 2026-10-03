import { moveBefore, stepMovePair, toggleValue } from "utils/listOrder";

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

describe("stepMovePair", () => {
    it("should land the item before its upper neighbour when moving up", () => {
        expect(stepMovePair(["a", "b", "c"], "b", -1)).toEqual(["b", "a"]);
    });

    it("should land the lower neighbour before the item when moving down", () => {
        expect(stepMovePair(["a", "b", "c"], "b", 1)).toEqual(["c", "b"]);
    });

    it("should swap the item with its neighbour once applied through moveBefore", () => {
        const list = ["a", "b", "c"];
        const [from, to] = stepMovePair(list, "a", 1) ?? ["", ""];

        expect(moveBefore(list, list.indexOf(from), list.indexOf(to))).toEqual([
            "b",
            "a",
            "c",
        ]);
    });

    it("should return null past either end of the list", () => {
        expect(stepMovePair(["a", "b"], "a", -1)).toBeNull();
        expect(stepMovePair(["a", "b"], "b", 1)).toBeNull();
    });

    it("should return null for an item the list lacks", () => {
        expect(stepMovePair(["a", "b"], "z", 1)).toBeNull();
    });
});
