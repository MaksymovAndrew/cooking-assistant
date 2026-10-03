import { menuKeyStep, menuKeyTarget } from "utils/menuKeyboard";

describe("menuKeyTarget", () => {
    it("should move down and wrap to the first item", () => {
        expect(menuKeyTarget("ArrowDown", 1, 4)).toBe(2);
        expect(menuKeyTarget("ArrowDown", 3, 4)).toBe(0);
    });

    it("should move up and wrap to the last item", () => {
        expect(menuKeyTarget("ArrowUp", 2, 4)).toBe(1);
        expect(menuKeyTarget("ArrowUp", 0, 4)).toBe(3);
    });

    it("should jump to either end", () => {
        expect(menuKeyTarget("Home", 2, 4)).toBe(0);
        expect(menuKeyTarget("End", 0, 4)).toBe(3);
    });

    it("should ignore any other key", () => {
        expect(menuKeyTarget("Tab", 1, 4)).toBeNull();
    });
});

describe("menuKeyStep", () => {
    it("should keep looking upwards for the keys that move up", () => {
        expect(menuKeyStep("ArrowUp")).toBe(-1);
        expect(menuKeyStep("End")).toBe(-1);
    });

    it("should keep looking downwards for the keys that move down", () => {
        expect(menuKeyStep("ArrowDown")).toBe(1);
        expect(menuKeyStep("Home")).toBe(1);
    });
});
