import i18next from "i18next";

import type { Ingredient } from "types/ingredient";

import { sortIngredientsByName } from "utils/sortIngredientsByName";

const t = i18next.getFixedT("en");
const LOCALE = "en";

const make = (id: number, name: string): Ingredient => ({
    id,
    slug: name.toLowerCase(),
    name,
    category: "vegetables",
    unit_name: "g",
    allergens: [],
    days_to_expire: null,
    calories_per_unit: null,
});

describe("sortIngredientsByName", () => {
    it("should sort ingredients alphabetically by name", () => {
        const a = make(1, "Banana");
        const b = make(2, "Apple");

        expect(sortIngredientsByName([a, b], t, LOCALE)).toEqual([b, a]);
    });

    it("should not mutate the input array", () => {
        const a = make(1, "Banana");
        const b = make(2, "Apple");
        const input = [a, b];

        sortIngredientsByName(input, t, LOCALE);

        expect(input).toEqual([a, b]);
    });
});
