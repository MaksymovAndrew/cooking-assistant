import { formatQuantity, roundQuantity } from "utils/roundQuantity";

describe("roundQuantity", () => {
    it("should drop floating point noise from a summed amount", () => {
        expect(String(roundQuantity(0.1 + 0.2))).toBe("0.3");
    });

    it("should keep at most two decimals", () => {
        expect(String(roundQuantity(2 / 3))).toBe("0.67");
    });
});

describe("formatQuantity", () => {
    it("should write the decimal separator the page's language uses", () => {
        expect(formatQuantity(2 / 3, "en")).toBe("0.67");
        expect(formatQuantity(2 / 3, "uk")).toBe("0,67");
    });

    it("should leave a whole amount without decimals", () => {
        expect(formatQuantity(3, "pl")).toBe("3");
    });
});
