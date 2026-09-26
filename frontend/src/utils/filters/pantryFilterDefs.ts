import type { TFunction } from "i18next";

import type { PantryIngredient, PantryLot } from "types/userIngredient";

import { getWorstLotExpiryStatus } from "utils/expiry";
import type { ClientFilterDef } from "utils/filters/clientFilterDef";
import { resolvePantryIngredientName } from "utils/ingredientName";

export const isUrgent = (
    daysToExpire: number | null | undefined,
    lots: PantryLot[],
): boolean => {
    const status = getWorstLotExpiryStatus(daysToExpire, lots);

    return status !== null && status.tone !== "ok";
};

export interface PantryFilterState {
    query: string;
    category: string | null;
    expiringSoonOnly: boolean;
}

// the query matches the name the viewer reads, so it needs the page's translator
const queryFilter = (
    t: TFunction,
): ClientFilterDef<PantryIngredient, string> => ({
    key: "query",
    defaultValue: "",
    isActive: (value) => value !== "",
    predicate: (item, value) =>
        resolvePantryIngredientName(t, item)
            .toLowerCase()
            .includes(value.trim().toLowerCase()),
});

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
    predicate: (item) => isUrgent(item.days_to_expire, item.lots),
};

export const pantryFilterDefs = (
    t: TFunction,
): readonly ClientFilterDef<PantryIngredient, unknown>[] => [
    queryFilter(t),
    categoryFilter,
    expiringSoonFilter,
];
