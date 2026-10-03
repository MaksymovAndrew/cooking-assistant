import type { TFunction } from "i18next";

import type { Ingredient } from "types/ingredient";

import { resolveIngredientName } from "utils/ingredientName";

interface CategoryLabel {
    key: string;
    label: string;
}

// category matches follow the name matches, so "meat" still finds Steak
export const searchIngredients = (
    ingredients: Ingredient[],
    categories: CategoryLabel[],
    query: string,
    t: TFunction,
    locale: string,
): Ingredient[] => {
    // resolved once, not per comparison
    const names = new Map<number, string>(
        ingredients.map((ingredient) => [
            ingredient.id,
            resolveIngredientName(t, ingredient),
        ]),
    );
    const byCachedName = (a: Ingredient, b: Ingredient): number =>
        (names.get(a.id) ?? "").localeCompare(names.get(b.id) ?? "", locale);

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
