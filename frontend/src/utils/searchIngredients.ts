import i18next from "i18next";

import type { Ingredient } from "types/ingredient";

import { resolveIngredientName } from "utils/ingredientName";

interface CategoryLabel {
    key: string;
    label: string;
}

// ranks name matches (starts-with, then contains) ahead of category matches, so searching "meat" surfaces Steak (category Meat) even though "meat" isn't in its name
export const searchIngredients = (
    ingredients: Ingredient[],
    categories: CategoryLabel[],
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
