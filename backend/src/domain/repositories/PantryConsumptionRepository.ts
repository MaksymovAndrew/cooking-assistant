import type { CalorieIntakeEntry, CalorieIntakeRow } from "./CalorieRepository";

export type CookSource = { recipeId: number } | { menuId: number };

// one portion's worth of an ingredient; a menu sums each of its recipes once
export interface CookRequirement {
    ingredient_id: number;
    slug: string;
    name: string;
    unit_name: string;
    quantity: number;
}

export interface CookIngredientNeed {
    ingredient_id: number;
    quantity: number;
}

export interface CookInput {
    source: CookSource;
    title: string;
    portions: number;
    needs: CookIngredientNeed[];
    calorieEntry: CalorieIntakeEntry | null;
}

export interface CookTaken {
    ingredient_id: number;
    quantity: number;
}

export interface CookOutcome {
    consumptionId: number;
    taken: CookTaken[];
    calorieIntake: CalorieIntakeRow | null;
}

// person_not_found: a session still valid for an account deleted since it was issued
export type CookResult = CookOutcome | "person_not_found";

// unavailable: already undone, or the undo window has closed
export type UndoCookingResult =
    "undone" | "not_found" | "unavailable" | "person_not_found";

export interface PantryConsumptionRepository {
    findRequirements(source: CookSource): Promise<CookRequirement[]>;
    cook(personId: number, input: CookInput): Promise<CookResult>;
    undo(
        personId: number,
        consumptionId: number,
        windowMs: number,
    ): Promise<UndoCookingResult>;
}
