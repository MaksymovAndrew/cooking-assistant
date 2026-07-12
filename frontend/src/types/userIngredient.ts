export interface UserIngredient {
    ingredient_id: number;
    ingredient_name: string;
    unit_name: string;
    quantity_person_ingradient: number;
    storage_condition?: string;
    seasonality?: string;
    days_to_expire?: number | null;
    allergens?: string | null;
    purchase_date?: string;
}

export interface PantryIngredient {
    id: number;
    name?: string;
    ingredient_name?: string;
    unit_name: string;
    quantity_person_ingradient: number;
    storage_condition?: string;
    seasonality?: string;
    days_to_expire?: number | null;
    allergens?: string | null;
    purchase_date?: string;
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

export interface UpdateQuantitiesRequest {
    updatedIngredients: PantryIngredient[];
}

export interface UpdatePurchaseRequest {
    quantity: number;
}
