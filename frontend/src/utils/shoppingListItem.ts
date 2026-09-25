import type { TFunction } from "i18next";

import type { ShoppingListItem } from "types/shoppingList";

import { resolveIngredientName } from "utils/ingredientName";
import { roundQuantity } from "utils/roundQuantity";

// a catalog item follows the viewer's language through its slug; a typed one keeps what was typed
export const shoppingListItemName = (
    t: TFunction,
    item: ShoppingListItem,
): string =>
    item.ingredient_slug === null
        ? item.name
        : resolveIngredientName(t, {
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
        : `${amount} ${item.unit_name}`;
};
