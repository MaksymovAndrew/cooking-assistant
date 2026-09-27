import i18next from "i18next";

import type { Ingredient } from "types/ingredient";

import { searchIngredients } from "utils/searchIngredients";

const t = i18next.getFixedT("en");
const LOCALE = "en";

const makeIngredient = (
    id: number,
    name: string,
    category: string,
): Ingredient => ({
    id,
    slug: `${name.toLowerCase()}-${id}`,
    name,
    category,
    unit_name: "g",
    allergens: [],
    days_to_expire: null,
    calories_per_unit: null,
});

const MEAT = { key: "meat", label: "Meat" };
const STEAK = makeIngredient(1, "Steak", "meat");
const MEATBALL = makeIngredient(2, "Meatball", "meat");
const MINCEMEAT = makeIngredient(3, "Mincemeat", "fruits");
const PEAR = makeIngredient(4, "Pear", "fruits");

const names = (results: Ingredient[]) => results.map((item) => item.name);

describe("searchIngredients", () => {
    it("should rank starts-with, then contains, then category matches", () => {
        expect(
            names(
                searchIngredients(
                    [STEAK, MINCEMEAT, MEATBALL, PEAR],
                    [MEAT],
                    "meat",
                    t,
                    LOCALE,
                ),
            ),
        ).toEqual(["Meatball", "Mincemeat", "Steak"]);
    });

    it("should list an ingredient once even when it matches twice", () => {
        expect(
            names(searchIngredients([MEATBALL], [MEAT], "meat", t, LOCALE)),
        ).toEqual(["Meatball"]);
    });

    it("should return nothing when neither name nor category matches", () => {
        expect(searchIngredients([PEAR], [MEAT], "salt", t, LOCALE)).toEqual(
            [],
        );
    });
});
