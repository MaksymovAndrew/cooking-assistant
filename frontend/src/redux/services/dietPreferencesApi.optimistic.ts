import type { AllergenSlug } from "constants/allergens";
import type { DietPreferences } from "types/dietPreferences";

// optimistic: the chip flips on press and flips back if the request fails
export const without = <T>(values: T[], value: T): T[] =>
    values.filter((entry) => entry !== value);

export const withAdded = <T>(values: T[], value: T): T[] =>
    values.includes(value) ? values : [...values, value];

// the four writes differ only in which list they patch and in which direction
export const patchAllergens =
    (slug: AllergenSlug, change: typeof withAdded) =>
    (preferences: DietPreferences) => {
        preferences.allergens = change(preferences.allergens, slug);
    };

export const patchIngredients =
    (id: number, change: typeof withAdded) =>
    (preferences: DietPreferences) => {
        preferences.ingredient_ids = change(preferences.ingredient_ids, id);
    };
