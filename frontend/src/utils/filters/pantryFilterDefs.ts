import type { PantryIngredient } from "types/userIngredient";

import { getExpiryStatus } from "utils/expiry";
import type { ClientFilterDef } from "utils/filters/clientFilterDef";
import { resolvePantryIngredientName } from "utils/ingredientName";

export const isUrgent = (
    daysToExpire: number | null | undefined,
    purchaseDate: string | undefined,
): boolean => {
    const status = getExpiryStatus(daysToExpire, purchaseDate);

    return status !== null && status.tone !== "ok";
};

export interface PantryFilterState {
    query: string;
    category: string | null;
    expiringSoonOnly: boolean;
}

const queryFilter: ClientFilterDef<PantryIngredient, string> = {
    key: "query",
    defaultValue: "",
    isActive: (value) => value !== "",
    predicate: (item, value) =>
        resolvePantryIngredientName(item)
            .toLowerCase()
            .includes(value.trim().toLowerCase()),
};

const categoryFilter: ClientFilterDef<PantryIngredient, string | null> = {
    key: "category",
    defaultValue: null,
    isActive: (value) => value !== null,
    predicate: (item, value) => item.category === value,
};

const expiringSoonFilter: ClientFilterDef<PantryIngredient, boolean> = {
    key: "expiringSoonOnly",
    defaultValue: false,
    isActive: (value) => value,
    predicate: (item) => isUrgent(item.days_to_expire, item.purchase_date),
};

export const PANTRY_FILTER_DEFS: readonly ClientFilterDef<
    PantryIngredient,
    unknown
>[] = [queryFilter, categoryFilter, expiringSoonFilter];
