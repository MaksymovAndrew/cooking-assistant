import { useMemo } from "react";

import { CATEGORY_KEYS } from "constants/ingredientCategories";

import { resolveCategory } from "utils/ingredientName";

export interface IngredientCategoryOption {
    key: string;
    label: string;
    count: number;
}

interface CategorizedItem {
    category: string;
}

// counts occurrences per category and returns only the categories actually present,
// in the catalog's canonical order - shared by the picker/browse combobox and the pantry filter
export const useIngredientCategories = (
    ingredients: CategorizedItem[],
): IngredientCategoryOption[] =>
    useMemo(() => {
        const counts = new Map<string, number>();

        ingredients.forEach((ingredient) => {
            counts.set(
                ingredient.category,
                (counts.get(ingredient.category) ?? 0) + 1,
            );
        });

        return CATEGORY_KEYS.filter((key) => counts.has(key)).map((key) => ({
            key,
            label: resolveCategory(key),
            count: counts.get(key) ?? 0,
        }));
    }, [ingredients]);
