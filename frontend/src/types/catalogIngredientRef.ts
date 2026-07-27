// shared shape for "a reference to a catalog ingredient" used by domain-facing view models
// (Ingredient, PantryIngredient, RecipeFormIngredient, RecipeDetailIngredient, ExpiringIngredient).
// Only `slug` is common to all of them today - `id`/`category` aren't present on every one, so
// they stay declared per-type rather than being faked here. Wire DTOs mirroring raw API/SQL
// column names (UserIngredient, MissingIngredient - `ingredient_slug`) intentionally don't use this.
export interface CatalogIngredientRef {
    slug: string;
}
