import {
    allocateFifo,
    allocateNeeds,
    roundQuantity,
} from "domain/pantry/allocateFifo";

describe("allocateFifo", () => {
    it("should take from the oldest lot first", () => {
        const result = allocateFifo(
            [
                { id: 1, quantity: 5 },
                { id: 2, quantity: 5 },
            ],
            3,
        );

        expect(result).toEqual({
            deductions: [{ lotId: 1, taken: 3, remaining: 2 }],
            shortfall: 0,
        });
    });

    it("should split a need across lots once the oldest runs out", () => {
        const result = allocateFifo(
            [
                { id: 1, quantity: 2 },
                { id: 2, quantity: 5 },
            ],
            4,
        );

        expect(result.deductions).toEqual([
            { lotId: 1, taken: 2, remaining: 0 },
            { lotId: 2, taken: 2, remaining: 3 },
        ]);
    });

    it("should use a lot up exactly, with no float remainder left behind", () => {
        const result = allocateFifo([{ id: 1, quantity: 0.3 }], 0.1 + 0.2);

        expect(result.deductions).toEqual([
            { lotId: 1, taken: 0.3, remaining: 0 },
        ]);
    });

    it("should report the shortfall when the lots do not cover the need", () => {
        const result = allocateFifo([{ id: 1, quantity: 1.5 }], 4);

        expect(result).toEqual({
            deductions: [{ lotId: 1, taken: 1.5, remaining: 0 }],
            shortfall: 2.5,
        });
    });

    it("should take nothing when there are no lots", () => {
        expect(allocateFifo([], 2)).toEqual({ deductions: [], shortfall: 2 });
    });

    it("should skip a lot that is already empty", () => {
        const result = allocateFifo(
            [
                { id: 1, quantity: 0 },
                { id: 2, quantity: 1 },
            ],
            1,
        );

        expect(result.deductions).toEqual([
            { lotId: 2, taken: 1, remaining: 0 },
        ]);
    });
});

describe("roundQuantity", () => {
    // compared as text: the point is that no float noise survives, which a tolerance would hide
    it("should round to three decimals", () => {
        expect(String(roundQuantity(0.1 + 0.2))).toBe("0.3");
        expect(String(roundQuantity(1.23456))).toBe("1.235");
    });
});

describe("allocateNeeds", () => {
    it("should allocate each ingredient from its own lots and leave out ingredients without lots", () => {
        const result = allocateNeeds(
            [
                { ingredient_id: 10, quantity: 3 },
                { ingredient_id: 20, quantity: 1 },
                { ingredient_id: 30, quantity: 2 },
            ],
            [
                { id: 1, ingredient_id: 10, quantity: 2 },
                { id: 2, ingredient_id: 20, quantity: 4 },
                { id: 3, ingredient_id: 10, quantity: 2 },
            ],
        );

        expect(result).toEqual([
            { ingredient_id: 10, lotId: 1, taken: 2, remaining: 0 },
            { ingredient_id: 10, lotId: 3, taken: 1, remaining: 1 },
            { ingredient_id: 20, lotId: 2, taken: 1, remaining: 3 },
        ]);
    });
});
