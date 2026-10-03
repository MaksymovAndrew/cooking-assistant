import { intakeCalories } from "application/use-cases/calories/intakeCalories";

describe("intakeCalories", () => {
    it("should round the per-portion value before multiplying", () => {
        expect(intakeCalories(21.6, 3)).toBe(66);
    });

    it("should return a whole number for a whole per-portion value", () => {
        expect(intakeCalories(250, 2)).toBe(500);
    });
});
