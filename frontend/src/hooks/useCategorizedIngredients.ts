import i18next from "i18next";
import { useEffect, useMemo, useState } from "react";

import type { Ingredient } from "types/ingredient";

import { resolveIngredientName } from "utils/ingredientName";
import { sortIngredientsByName } from "utils/sortIngredientsByName";

import type { IngredientCategoryOption } from "./useIngredientCategories";
import { useIngredientCategories } from "./useIngredientCategories";

// ranks name matches (starts-with, then contains) ahead of category matches, so searching "meat" surfaces Steak (category Meat) even though "meat" isn't in its name
const searchIngredients = (
    ingredients: Ingredient[],
    categories: IngredientCategoryOption[],
    query: string,
): Ingredient[] => {
    // resolve each name once (i18next lookup) and reuse it for both matching and sorting, instead of re-resolving per comparison
    const names = new Map<number, string>(
        ingredients.map((ingredient) => [
            ingredient.id,
            resolveIngredientName(ingredient),
        ]),
    );
    const byCachedName = (a: Ingredient, b: Ingredient): number =>
        (names.get(a.id) ?? "").localeCompare(
            names.get(b.id) ?? "",
            i18next.language,
        );

    const startsWithMatches: Ingredient[] = [];
    const containsMatches: Ingredient[] = [];

    ingredients.forEach((ingredient) => {
        const index = (names.get(ingredient.id) ?? "")
            .toLowerCase()
            .indexOf(query);

        if (index === 0) {
            startsWithMatches.push(ingredient);
        } else if (index > 0) {
            containsMatches.push(ingredient);
        }
    });

    const matchedIds = new Set(
        [...startsWithMatches, ...containsMatches].map(
            (ingredient) => ingredient.id,
        ),
    );
    const matchingCategoryKeys = new Set(
        categories
            .filter((category) => category.label.toLowerCase().includes(query))
            .map((category) => category.key),
    );
    const categoryMatches = ingredients.filter(
        (ingredient) =>
            !matchedIds.has(ingredient.id) &&
            matchingCategoryKeys.has(ingredient.category),
    );

    return [
        ...[...startsWithMatches].sort(byCachedName),
        ...[...containsMatches].sort(byCachedName),
        ...[...categoryMatches].sort(byCachedName),
    ];
};

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

    const categories = useIngredientCategories(ingredients);

    // drops a stale category selection (its last addable item just got picked) rather than showing a "back" panel for a category that no longer exists
    useEffect(() => {
        if (
            activeCategory &&
            !categories.some((category) => category.key === activeCategory)
        ) {
            setActiveCategory(null);
        }
    }, [activeCategory, categories]);

    const visibleIngredients = useMemo(() => {
        if (trimmedQuery) {
            return searchIngredients(
                ingredients,
                categories,
                trimmedQuery.toLowerCase(),
            ).slice(0, maxSearchResults);
        }

        if (activeCategory) {
            return sortIngredientsByName(
                ingredients.filter(
                    (ingredient) => ingredient.category === activeCategory,
                ),
            );
        }

        return [];
    }, [
        ingredients,
        categories,
        trimmedQuery,
        activeCategory,
        maxSearchResults,
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
