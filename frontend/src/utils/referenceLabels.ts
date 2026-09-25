import type { TFunction } from "i18next";

import { formatQuantity, roundQuantity } from "utils/roundQuantity";

// recipe types, menu categories and units are seeded by their English name, which the seed also matches rows on, so
// that name is their key; the stored name is the defaultValue so an unknown row still renders
const referenceKey = (name: string): string =>
    name.trim().toLowerCase().replace(/\s+/g, "_");

export const recipeTypeName = (t: TFunction, name: string): string =>
    t(`common:recipeTypes.${referenceKey(name)}.name`, { defaultValue: name });

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

// a count picks the plural form (3 cloves, 5 зубчиков); without one the unit is named on its own, as in a column label
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
