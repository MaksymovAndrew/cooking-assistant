import type { TFunction } from "i18next";

interface ResolvableIngredient {
    slug: string;
    name: string;
}

// t comes from the component's own instance, never the global one: on the server that is this
// request's language. The DB name is the defaultValue so a missing catalog translation still renders something
export const resolveIngredientName = (
    t: TFunction,
    { slug, name }: ResolvableIngredient,
): string => t(`catalog:ingredient.${slug}`, { defaultValue: name });

interface PantryLikeIngredient {
    slug: string;
    name?: string;
    ingredient_name?: string;
}

// PantryIngredient carries the display name under either field depending on the call site
export const resolvePantryIngredientName = (
    t: TFunction,
    ingredient: PantryLikeIngredient,
): string =>
    resolveIngredientName(t, {
        slug: ingredient.slug,
        name: ingredient.ingredient_name ?? ingredient.name ?? "",
    });

export const resolveCategory = (t: TFunction, categoryKey: string): string =>
    t(`catalog:category.${categoryKey}`, { defaultValue: categoryKey });

export const resolveAllergen = (t: TFunction, allergenSlug: string): string =>
    t(`catalog:allergen.${allergenSlug}`, {
        defaultValue: allergenSlug,
    });
