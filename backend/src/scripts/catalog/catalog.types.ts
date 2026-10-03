export const CATEGORY_KEYS = [
    "vegetables",
    "fruits",
    "berries",
    "herbs",
    "mushrooms",
    "meat",
    "offal",
    "poultry",
    "fish",
    "seafood",
    "dairy",
    "eggs",
    "cheese",
    "grains_legumes",
    "pasta",
    "flour_baking",
    "nuts_seeds",
    "oils_fats",
    "spices",
    "sauces_vinegars",
    "sweeteners",
    "canned",
    "beverages",
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

import type { AllergenSlug } from "constants/allergens";

export { ALLERGEN_SLUGS, type AllergenSlug } from "constants/allergens";

export const UNIT_KEYS = [
    "g",
    "kg",
    "ml",
    // capital L: on a row next to a number a lowercase "l" reads as a one
    "L",
    "tsp",
    "tbsp",
    "piece",
    "clove",
    "bunch",
    "sprig",
    "slice",
    "head",
    "can",
    "package",
] as const;

export type UnitKey = (typeof UNIT_KEYS)[number];

// only weight and volume units convert; the rest are counted, with no fixed coefficient
export const UNIT_COEFFICIENTS: Partial<Record<UnitKey, number>> = {
    g: 1,
    kg: 1000,
    ml: 1,
    L: 1000,
    tsp: 5,
    tbsp: 15,
};

export const COUNTED_UNIT_KEYS = UNIT_KEYS.filter(
    (unit) => !(unit in UNIT_COEFFICIENTS),
);

export interface CatalogMapEntry {
    slug: string;
    category: CategoryKey;
    // distinct from slug so it can be a full, disambiguated phrase ("Bell pepper", not "pepper")
    searchName: string;
    // exact, case-insensitive source description when its naming diverges from searchName
    nutritionMatch?: string;
    unit: UnitKey;
    // grams per counted unit, so calories per 100 g can convert to calories per unit
    unitGrams?: number;
    allergens: AllergenSlug[];
    daysToExpire: number;
    seasonality: string;
    storageCondition: string;
}
