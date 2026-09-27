import i18next from "i18next";

import type { ShoppingListItem } from "types/shoppingList";

import {
    shoppingListItemName,
    shoppingListItemQuantity,
} from "utils/shoppingListItem";

const t = i18next.getFixedT("en");

const TYPED: ShoppingListItem = {
    id: 1,
    name: "oat milk",
    note: null,
    ingredient_id: null,
    ingredient_slug: null,
    unit_name: null,
    quantity: null,
    checked: false,
    position: 0,
};

describe("shoppingListItemName", () => {
    it("should keep a typed item's name as it was written", () => {
        expect(shoppingListItemName(t, TYPED)).toBe("oat milk");
    });

    it("should fall back to the stored name for a slug the catalog does not know", () => {
        expect(
            shoppingListItemName(t, {
                ...TYPED,
                name: "Mystery root",
                ingredient_id: 5,
                ingredient_slug: "not-in-catalog",
            }),
        ).toBe("Mystery root");
    });
});

describe("shoppingListItemQuantity", () => {
    it("should return null for an item without a quantity", () => {
        expect(shoppingListItemQuantity(t, "en", TYPED)).toBeNull();
    });

    it("should round a scaled amount to two decimals and append its unit", () => {
        expect(
            shoppingListItemQuantity(t, "en", {
                ...TYPED,
                quantity: 333.3333,
                unit_name: "not-a-unit",
            }),
        ).toBe("333.33 not-a-unit");
    });

    it("should show a bare amount when the item has no unit", () => {
        expect(
            shoppingListItemQuantity(t, "en", { ...TYPED, quantity: 2.5 }),
        ).toBe("2.5");
    });
});
