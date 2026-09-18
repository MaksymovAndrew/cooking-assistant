import type { AllergenSlug } from "constants/allergens";

export interface DietPreferences {
    allergens: AllergenSlug[];
    ingredient_ids: number[];
}

// person_not_found: a session still valid for an account deleted since it was issued
export type AvoidIngredientOutcome =
    "added" | "ingredient_not_found" | "person_not_found";

export interface DietPreferencesRepository {
    findByPerson(personId: number): Promise<DietPreferences>;
    // false when the person no longer exists, so the caller answers 404 instead of a foreign-key 500
    addAllergen(personId: number, allergen: AllergenSlug): Promise<boolean>;
    removeAllergen(personId: number, allergen: AllergenSlug): Promise<void>;
    addIngredient(
        personId: number,
        ingredientId: number,
    ): Promise<AvoidIngredientOutcome>;
    removeIngredient(personId: number, ingredientId: number): Promise<void>;
}
