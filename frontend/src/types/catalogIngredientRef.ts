// shared shape for domain-facing ingredient view models - only `slug` is common to all of them, so `id`/`category` stay declared per-type instead of being faked here
export interface CatalogIngredientRef {
    slug: string;
}
