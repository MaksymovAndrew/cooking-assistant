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

    // a category whose last item was just picked is gone; reset during render, not in an effect
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
