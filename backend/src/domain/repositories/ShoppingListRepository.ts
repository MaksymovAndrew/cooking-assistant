export interface ShoppingListItemRow {
    id: number;
    name: string;
    note: string | null;
    ingredient_id: number | null;
    ingredient_slug: string | null;
    unit_name: string | null;
    quantity: number | null;
    checked: boolean;
    position: number;
}

export interface ShoppingListItemInput {
    name: string;
    note: string | null;
}

export interface ShoppingListItemChanges {
    note?: string | null;
    checked?: boolean;
}

export interface ShoppingListIngredientInput {
    ingredient_id: number;
    quantity: number | null;
}

// person_not_found: a session still valid for an account deleted since it was issued
export type ShoppingListAddOutcome =
    "added" | "limit_reached" | "person_not_found";

export type ShoppingListAddItemResult =
    | { outcome: "added"; item: ShoppingListItemRow }
    | { outcome: "limit_reached"; item: null }
    | { outcome: "person_not_found"; item: null };

export interface ShoppingListRepository {
    findByPerson(personId: number): Promise<ShoppingListItemRow[]>;
    addItem(
        personId: number,
        item: ShoppingListItemInput,
        maxItems: number,
    ): Promise<ShoppingListAddItemResult>;
    updateItem(
        personId: number,
        itemId: number,
        changes: ShoppingListItemChanges,
    ): Promise<ShoppingListItemRow | null>;
    deleteItem(personId: number, itemId: number): Promise<boolean>;
    deleteChecked(personId: number): Promise<void>;
    // false when ids aren't exactly the person's current items, e.g. a stale client
    reorder(personId: number, ids: number[]): Promise<boolean>;
    // merges into an unchecked item of the same ingredient; nothing is added when the new items wouldn't fit
    addIngredients(
        personId: number,
        items: ShoppingListIngredientInput[],
        maxItems: number,
    ): Promise<ShoppingListAddOutcome>;
}
