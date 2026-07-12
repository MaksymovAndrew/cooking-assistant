import type { Ingredient } from "types/ingredient";

import { sortIngredientsByName } from "utils/sortIngredientsByName";

const make = (id: number, name: string): Ingredient => ({
    id,
    name,
    unit_name: "g",
    allergens: null,
});

describe("sortIngredientsByName", () => {
    it("should sort ingredients alphabetically by name", () => {
        const a = make(1, "Banana");
        const b = make(2, "Apple");

        expect(sortIngredientsByName([a, b])).toEqual([b, a]);
    });

    it("should not mutate the input array", () => {
        const a = make(1, "Banana");
        const b = make(2, "Apple");
        const input = [a, b];

        sortIngredientsByName(input);

        expect(input).toEqual([a, b]);
    });
});
