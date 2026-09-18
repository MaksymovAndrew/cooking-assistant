// mirrors backend/src/constants/allergens.ts - the EU's 14 mandatory allergens, in the order they are offered
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

export const isAllergenSlug = (value: string): value is AllergenSlug =>
    ALLERGEN_SLUGS.some((slug) => slug === value);
