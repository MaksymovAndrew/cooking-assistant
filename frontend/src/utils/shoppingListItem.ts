import type { ShoppingListItem } from "types/shoppingList";

import { resolveIngredientName, resolveUnit } from "utils/ingredientName";

const QUANTITY_DECIMALS = 2;

// a catalog item follows the viewer's language through its slug; a typed one keeps what was typed
export const shoppingListItemName = (item: ShoppingListItem): string =>
    item.ingredient_slug === null
        ? item.name
        : resolveIngredientName({
              slug: item.ingredient_slug,
              name: item.name,
          });

// scaled recipe amounts arrive as long fractions, so two decimals are enough to shop by
export const shoppingListItemQuantity = (
    item: ShoppingListItem,
): string | null => {
    if (item.quantity === null) {
        return null;
    }

    const amount = Number(item.quantity.toFixed(QUANTITY_DECIMALS));

    return item.unit_name === null
        ? String(amount)
        : `${amount} ${resolveUnit(item.unit_name)}`;
};
