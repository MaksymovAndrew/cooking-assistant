import { sumBy } from "utils/sum";

describe("sumBy", () => {
    it("should add up the value picked from each item", () => {
        expect(sumBy([{ kcal: 120 }, { kcal: 80 }], (item) => item.kcal)).toBe(
            200,
        );
    });

    it("should be zero for an empty list", () => {
        expect(sumBy([], () => 1)).toBe(0);
    });
});
