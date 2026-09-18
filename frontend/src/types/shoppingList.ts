export interface ShoppingListItem {
    id: number;
    name: string;
    note: string | null;
    // set only for an item added from the catalog; its name then resolves through the slug
    ingredient_id: number | null;
    ingredient_slug: string | null;
    unit_name: string | null;
    quantity: number | null;
    checked: boolean;
    position: number;
}

export interface AddShoppingListItemRequest {
    name: string;
    note: string | null;
}

export interface UpdateShoppingListItemRequest {
    id: number;
    checked: boolean;
}

export interface ReorderShoppingListRequest {
    ids: number[];
}

// null adds the ingredient by name alone, for when only the shopper can tell how much to buy
export interface ShoppingListIngredientEntry {
    ingredient_id: number;
    quantity: number | null;
}

export interface AddIngredientsToShoppingListRequest {
    items: ShoppingListIngredientEntry[];
}
