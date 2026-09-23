import type { Ingredient } from "types/ingredient";
import type { PantryIngredient } from "types/userIngredient";

import { pantryAddCandidates } from "utils/pantryAddCandidates";

const makeIngredient = (id: number, slug: string): Ingredient => ({
    id,
    slug,
    name: slug,
    category: "vegetables",
    unit_name: "g",
    allergens: [],
    days_to_expire: null,
    calories_per_unit: null,
});

const CARROT = makeIngredient(1, "carrot");
const ONION = makeIngredient(2, "onion");
const LEEK = makeIngredient(3, "leek");

const STOCKED_CARROT: PantryIngredient = {
    id: 1,
    slug: "carrot",
    ingredient_name: "Carrot",
    category: "vegetables",
    unit_name: "g",
    quantity_person_ingradient: 1,
    allergens: [],
    lots: [],
};

describe("pantryAddCandidates", () => {
    it("should leave out what the pantry already holds", () => {
        expect(
            pantryAddCandidates([CARROT, ONION], [STOCKED_CARROT], []),
        ).toEqual([ONION]);
    });

    it("should leave out what is already picked in this batch", () => {
        expect(pantryAddCandidates([CARROT, ONION, LEEK], [], [2])).toEqual([
            CARROT,
            LEEK,
        ]);
    });

    it("should offer the whole catalog to an empty pantry", () => {
        expect(pantryAddCandidates([CARROT, ONION], [], [])).toEqual([
            CARROT,
            ONION,
        ]);
    });
});
