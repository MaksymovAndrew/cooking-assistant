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
