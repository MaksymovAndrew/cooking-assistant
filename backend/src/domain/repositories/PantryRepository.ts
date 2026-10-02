export interface PantryIngredientInput {
    id: number;
    quantity_person_ingradient: number;
}

// built by json_agg, so its date arrives as text rather than a Date
export interface PantryLot {
    id: number;
    quantity: number;
    purchase_date: string;
}

export interface PantryIngredient {
    ingredient_id: number;
    ingredient_slug: string;
    ingredient_name: string;
    category: string;
    quantity_person_ingradient: number;
    unit_name: string;
    allergens: string[];
    days_to_expire: number | null;
    seasonality: string | null;
    storage_condition: string | null;
    // the oldest (soonest-expiring) lot's date - MIN(ingredient_purchases.purchase_date), not
    // person_ingredients.purchase_date, which a top-up resets and would wrongly "refresh" older stock
    purchase_date: Date | null;
    lots: PantryLot[];
    calories_per_unit: number | null;
}

export interface PurchaseHistoryEntry {
    id: number;
    quantity: number;
    purchase_date: Date;
    unit_name: string;
    days_to_expire: number | null;
}

export interface PantryRepository {
    findByUser(userId: number): Promise<PantryIngredient[]>;
    addIngredients(
        userId: number,
        items: PantryIngredientInput[],
    ): Promise<void>;
    // false when the person has no such ingredient
    deleteIngredient(userId: number, ingredientId: number): Promise<boolean>;
    // false when the purchase is not the person's
    updatePurchaseQuantity(
        userId: number,
        purchaseId: number,
        quantity: number,
    ): Promise<boolean>;
    deletePurchases(userId: number, purchaseIds: number[]): Promise<number>;
    findPurchaseHistory(
        userId: number,
        ingredientId: number,
    ): Promise<PurchaseHistoryEntry[]>;
}
