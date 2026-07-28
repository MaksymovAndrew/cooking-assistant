// single source of truth for the closed sets the catalog pipeline and its consumers (zod schema, locale generator) all iterate over

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

// EU FIC (1169/2011) Annex II - the 14 mandatory allergens
export const ALLERGEN_SLUGS = [
    "gluten",
    "crustaceans",
    "eggs",
    "fish",
    "peanuts",
    "soybeans",
    "milk",
    "nuts",
    "celery",
    "mustard",
    "sesame",
    "sulphites",
    "lupin",
    "molluscs",
] as const;

export type AllergenSlug = (typeof ALLERGEN_SLUGS)[number];

export const UNIT_KEYS = [
    "g",
    "kg",
    "ml",
    "l",
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

// units with a fixed weight/volume-per-unit coefficient; the rest are counted units with no fixed conversion
export const UNIT_COEFFICIENTS: Partial<Record<UnitKey, number>> = {
    g: 1,
    kg: 1000,
    ml: 1,
    l: 1000,
    tsp: 5,
    tbsp: 15,
};

export const COUNTED_UNIT_KEYS = UNIT_KEYS.filter(
    (unit) => !(unit in UNIT_COEFFICIENTS),
);

export interface CatalogMapEntry {
    slug: string;
    category: CategoryKey;
    // canonical English name used to look up translations and nutrition data - kept distinct from slug so it can be a full, disambiguated phrase ("Bell pepper", not "pepper")
    searchName: string;
    // exact (case-insensitive) nutrition-source description override, for entries where the source's naming diverges from searchName; omit to match searchName directly
    nutritionMatch?: string;
    unit: UnitKey;
    // grams per one counted unit (piece/clove/bunch/...) - required so calories-per-100g can convert to calories-per-unit; irrelevant for weight/volume units
    unitGrams?: number;
    allergens: AllergenSlug[];
    daysToExpire: number;
    seasonality: string;
    storageCondition: string;
}
