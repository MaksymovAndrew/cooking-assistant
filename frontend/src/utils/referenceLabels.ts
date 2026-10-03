import type { TFunction } from "i18next";

import { formatQuantity, roundQuantity } from "utils/roundQuantity";

// reference rows are keyed by their seeded English name; the stored name is the fallback
const referenceKey = (name: string): string =>
    name.trim().toLowerCase().replace(/\s+/g, "_");

export const recipeTypeName = (t: TFunction, name: string): string =>
    t(`common:recipeTypes.${referenceKey(name)}.name`, { defaultValue: name });

export const recipeTypeLabel = (
    t: TFunction,
    name: string | null,
): string | null => (name === null ? null : recipeTypeName(t, name));

export const recipeTypeDescription = (
    t: TFunction,
    name: string,
    description: string,
): string =>
    t(`common:recipeTypes.${referenceKey(name)}.description`, {
        defaultValue: description,
    });

export const menuCategoryName = (t: TFunction, name: string): string =>
    t(`common:menuCategories.${referenceKey(name)}`, { defaultValue: name });

// a count picks the plural form; without one the unit is named alone, as in a column label
export const unitName = (
    t: TFunction,
    unit: string,
    count: number | null = null,
): string =>
    t(`common:units.${referenceKey(unit)}`, {
        defaultValue: unit,
        ...(count === null ? {} : { count }),
    });

export const quantityWithUnit = (
    t: TFunction,
    locale: string,
    quantity: number,
    unit: string,
): string =>
    `${formatQuantity(quantity, locale)} ${unitName(t, unit, roundQuantity(quantity))}`;
