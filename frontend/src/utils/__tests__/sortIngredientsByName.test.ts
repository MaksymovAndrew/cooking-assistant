import i18next from "i18next";

import type { Ingredient } from "types/ingredient";

import { getServerTranslation } from "i18n/server";

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
    it("should sort by the name the viewer reads, not the stored one", async () => {
        const uk = await getServerTranslation("uk");
        const apple = make(1, "Apple");
        const banana = make(2, "Banana");

        // in Ukrainian the banana (Банан) comes before the apple (Яблуко)
        expect(sortIngredientsByName([apple, banana], uk, "uk")).toEqual([
            banana,
            apple,
        ]);
    });

    it("should not mutate the input array", () => {
        const a = make(1, "Banana");
        const b = make(2, "Apple");
        const input = [a, b];

        sortIngredientsByName(input, t, LOCALE);

        expect(input).toEqual([a, b]);
    });
});
