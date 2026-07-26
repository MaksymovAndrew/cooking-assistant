import i18next from "i18next";

interface ResolvableIngredient {
    slug: string;
    name: string;
}

// works outside React too (i18next is initialized synchronously) - the DB name is the
// defaultValue so an ingredient missing from the catalog locale still renders something
export const resolveIngredientName = ({
    slug,
    name,
}: ResolvableIngredient): string =>
    i18next.t(`catalog:ingredient.${slug}`, { defaultValue: name });

interface PantryLikeIngredient {
    slug: string;
    name?: string;
    ingredient_name?: string;
}

// PantryIngredient carries the display name under either field depending on the call site
export const resolvePantryIngredientName = (
    ingredient: PantryLikeIngredient,
): string =>
    resolveIngredientName({
        slug: ingredient.slug,
        name: ingredient.ingredient_name ?? ingredient.name ?? "",
    });

export const resolveUnit = (unitKey: string): string =>
    i18next.t(`catalog:unit.${unitKey}`, { defaultValue: unitKey });

export const resolveCategory = (categoryKey: string): string =>
    i18next.t(`catalog:category.${categoryKey}`, { defaultValue: categoryKey });

export const resolveAllergen = (allergenSlug: string): string =>
    i18next.t(`catalog:allergen.${allergenSlug}`, {
        defaultValue: allergenSlug,
    });
