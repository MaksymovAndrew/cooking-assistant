import type { CatalogIngredientRef } from "types/catalogIngredientRef";

// one purchase-history row, as returned nested under a pantry ingredient
export interface PantryLot {
    quantity: number;
    purchase_date: string;
}

export interface UserIngredient {
    ingredient_id: number;
    ingredient_slug: string;
    ingredient_name: string;
    category: string;
    unit_name: string;
    quantity_person_ingradient: number;
    storage_condition?: string;
    seasonality?: string;
    days_to_expire?: number | null;
    allergens: string[];
    // the oldest (soonest-expiring) lot's date, not the aggregate row's own date - a top-up must
    // not "refresh" older stock's expiry
    purchase_date?: string;
    lots: PantryLot[];
}

export interface PantryIngredient extends CatalogIngredientRef {
    id: number;
    name?: string;
    ingredient_name?: string;
    category: string;
    unit_name: string;
    quantity_person_ingradient: number;
    storage_condition?: string;
    seasonality?: string;
    days_to_expire?: number | null;
    allergens: string[];
    purchase_date?: string;
    lots: PantryLot[];
}

export interface Purchase {
    id: number;
    quantity: number;
    purchase_date: string;
    unit_name: string;
    days_to_expire: number;
}

export interface SaveUserIngredientItem {
    id: number;
    ingredient_name: string;
    quantity_person_ingradient: number;
}

export interface SaveUserIngredientsRequest {
    ingredients: SaveUserIngredientItem[];
}

export interface UpdatePurchaseRequest {
    quantity: number;
}
