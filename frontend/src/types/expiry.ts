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

// one expired purchase lot, as shown in the expired-ingredients notice
export interface ExpiredLot {
    quantity: number;
    purchaseDate: string;
    expiryDate: string;
}

// richer than ExpiringIngredient - the notice lists every expired lot with its own purchase
// date, expiry date and quantity, not just a single worst-case status per ingredient
export interface ExpiredPantryIngredient extends CatalogIngredientRef {
    ingredientId: number;
    name: string;
    unitName: string;
    lots: ExpiredLot[];
}
