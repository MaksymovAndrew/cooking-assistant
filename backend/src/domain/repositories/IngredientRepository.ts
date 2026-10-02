export interface CatalogIngredient {
    id: number;
    slug: string;
    name: string;
    category: string;
    unit_name: string | null;
    allergens: string[];
    days_to_expire: number | null;
    calories_per_unit: number | null;
}

export interface IngredientRepository {
    findAll(): Promise<CatalogIngredient[]>;
    findExistingIds(ids: number[]): Promise<number[]>;
}
