import type { CatalogIngredientRef } from "types/catalogIngredientRef";

export type ExpiryTone = "expired" | "warning" | "ok";

export interface ExpiryStatus {
    tone: ExpiryTone;
    days: number;
}

export interface ExpiringIngredient extends CatalogIngredientRef {
    ingredientId: number;
    name: string;
    status: ExpiryStatus;
}
