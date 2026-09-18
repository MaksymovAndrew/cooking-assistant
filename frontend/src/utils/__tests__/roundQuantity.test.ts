import { roundQuantity } from "utils/roundQuantity";

describe("roundQuantity", () => {
    it("should drop floating point noise from a summed amount", () => {
        expect(String(roundQuantity(0.1 + 0.2))).toBe("0.3");
    });

    it("should keep at most two decimals", () => {
        expect(String(roundQuantity(2 / 3))).toBe("0.67");
    });
});
