// the database's own limits: a value past one would reach the INSERT and fail there as a 500
export const FIELD_LIMITS = {
    INT4_MAX: 2147483647,
    RECIPE_TITLE_LENGTH: 255,
    MENU_TITLE_LENGTH: 100,
    PERSON_TEXT_LENGTH: 255,
    // bcrypt reads only the first 72 bytes, so a longer password would match on its prefix alone
    PASSWORD_BYTES: 72,
    MAX_RECIPE_INGREDIENTS: 200,
    MAX_PANTRY_ITEMS: 200,
    MAX_MENU_RECIPES: 500,
} as const;
