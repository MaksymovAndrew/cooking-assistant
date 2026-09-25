import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";

import { useLocale } from "hooks/useLocale";

import { searchIngredients } from "utils/searchIngredients";
import { sortIngredientsByName } from "utils/sortIngredientsByName";

import type { IngredientCategoryOption } from "./useIngredientCategories";
import { useIngredientCategories } from "./useIngredientCategories";

interface UseCategorizedIngredientsOptions {
    ingredients: Ingredient[];
    maxSearchResults: number;
}

interface UseCategorizedIngredientsResult {
    query: string;
    setQuery: (query: string) => void;
    trimmedQuery: string;
    activeCategory: string | null;
    setActiveCategory: (category: string | null) => void;
    categories: IngredientCategoryOption[];
    visibleIngredients: Ingredient[];
}

// shared browse/search state for the ingredient picker and the pantry add-ingredient modal - both need the same "search across everything, or drill into a category" combobox behaviour
export const useCategorizedIngredients = ({
    ingredients,
    maxSearchResults,
}: UseCategorizedIngredientsOptions): UseCategorizedIngredientsResult => {
    const [query, setQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const trimmedQuery = query.trim();
    const { t } = useTranslation();
    const locale = useLocale();

    const categories = useIngredientCategories(ingredients);

    // drops a stale category selection (its last addable item just got picked) rather than showing a "back" panel for a category that no longer exists - adjusted during render, not via an effect, since it's already a conditional, idempotent correction
    if (
        activeCategory &&
        !categories.some((category) => category.key === activeCategory)
    ) {
        setActiveCategory(null);
    }

    const visibleIngredients = useMemo(() => {
        if (trimmedQuery) {
            return searchIngredients(
                ingredients,
                categories,
                trimmedQuery.toLowerCase(),
                t,
                locale,
            ).slice(0, maxSearchResults);
        }

        if (activeCategory) {
            return sortIngredientsByName(
                ingredients.filter(
                    (ingredient) => ingredient.category === activeCategory,
                ),
                t,
                locale,
            );
        }

        return [];
    }, [
        ingredients,
        categories,
        trimmedQuery,
        activeCategory,
        maxSearchResults,
        t,
        locale,
    ]);

    return {
        query,
        setQuery,
        trimmedQuery,
        activeCategory,
        setActiveCategory,
        categories,
        visibleIngredients,
    };
};
