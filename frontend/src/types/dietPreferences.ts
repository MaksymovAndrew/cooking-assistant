import type { AllergenSlug } from "constants/allergens";

export interface DietPreferences {
    allergens: AllergenSlug[];
    ingredient_ids: number[];
}
