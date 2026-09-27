import { useMemo } from "react";
import { useTranslation } from "react-i18next";

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

// counts occurrences per category, returning only categories actually present, in the catalog's canonical order
export const useIngredientCategories = (
    ingredients: CategorizedItem[],
): IngredientCategoryOption[] => {
    const { t } = useTranslation();

    return useMemo(() => {
        const counts = new Map<string, number>();

        ingredients.forEach((ingredient) => {
            counts.set(
                ingredient.category,
                (counts.get(ingredient.category) ?? 0) + 1,
            );
        });

        return CATEGORY_KEYS.filter((key) => counts.has(key)).map((key) => ({
            key,
            label: resolveCategory(t, key),
            count: counts.get(key) ?? 0,
        }));
    }, [ingredients, t]);
};
