import { getPantryRecipesCardState } from "utils/pantryRecipesCard";

describe("getPantryRecipesCardState", () => {
    it("should point to the pantry when it is empty", () => {
        expect(getPantryRecipesCardState(0, null)).toBe("empty-pantry");
    });

    it("should wait while the count is on its way", () => {
        expect(getPantryRecipesCardState(4, null)).toBe("counting");
    });

    it("should say so when the pantry covers no whole recipe", () => {
        expect(getPantryRecipesCardState(4, 0)).toBe("none");
    });

    it("should show the count once some recipes are covered", () => {
        expect(getPantryRecipesCardState(4, 7)).toBe("ready");
    });
});
