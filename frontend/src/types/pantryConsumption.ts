import type { CalorieIntakeItem } from "types/calorie";

export interface CookRecordRequest {
    recipe_id?: number;
    menu_id?: number;
    portions: number;
    log_calories: boolean;
}

export interface CookedIngredient {
    ingredient_id: number;
    slug: string;
    name: string;
    unit_name: string;
    needed: number;
    quantity: number;
}

export interface SkippedIngredient {
    ingredient_id: number;
    slug: string;
    name: string;
}

export interface CookSummary {
    consumptionId: number;
    deducted: CookedIngredient[];
    skipped: SkippedIngredient[];
    calorieIntake: CalorieIntakeItem | null;
}

// one portion's worth of an ingredient, taken from the page the cook button sits on
export interface CookRequirement {
    ingredient_id: number;
    slug: string;
    name: string;
    unit_name: string;
    quantity: number;
}
