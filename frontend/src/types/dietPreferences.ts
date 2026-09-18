import type { AllergenSlug } from "constants/allergens";

// shape returned by GET /api/diet-preferences
export interface DietPreferences {
    allergens: AllergenSlug[];
    ingredient_ids: number[];
}
