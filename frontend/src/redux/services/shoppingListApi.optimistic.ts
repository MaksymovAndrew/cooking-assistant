import type { ShoppingListItem } from "types/shoppingList";

export const tickItem =
    (id: number, checked: boolean) =>
    (items: ShoppingListItem[]): void => {
        const item = items.find((entry) => entry.id === id);

        if (item) {
            item.checked = checked;
        }
    };

export const applyOrder =
    (ids: number[]) =>
    (items: ShoppingListItem[]): void => {
        items.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    };
