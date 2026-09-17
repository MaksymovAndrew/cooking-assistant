import type { ShoppingListItem } from "types/shoppingList";

import { resolveIngredientName, resolveUnit } from "utils/ingredientName";
import { roundQuantity } from "utils/roundQuantity";

// a catalog item follows the viewer's language through its slug; a typed one keeps what was typed
export const shoppingListItemName = (item: ShoppingListItem): string =>
    item.ingredient_slug === null
        ? item.name
        : resolveIngredientName({
              slug: item.ingredient_slug,
              name: item.name,
          });

export const shoppingListItemQuantity = (
    item: ShoppingListItem,
): string | null => {
    if (item.quantity === null) {
        return null;
    }

    const amount = roundQuantity(item.quantity);

    return item.unit_name === null
        ? String(amount)
        : `${amount} ${resolveUnit(item.unit_name)}`;
};
