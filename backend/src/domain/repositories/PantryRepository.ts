export interface PantryIngredientInput {
    id: number;
    quantity_person_ingradient: number;
}

export interface PantryRepository {
    findByUser(userId: string | number): Promise<unknown[]>;
    addIngredients(
        userId: string | number,
        items: PantryIngredientInput[],
    ): Promise<void>;
    deleteIngredient(
        userId: string | number,
        ingredientId: string | number,
    ): Promise<unknown>;
    updatePurchaseQuantity(
        userId: string | number,
        purchaseId: string | number,
        quantity: number,
    ): Promise<unknown>;
    findPurchaseHistory(
        userId: string | number,
        ingredientId: string | number,
    ): Promise<unknown[]>;
}
