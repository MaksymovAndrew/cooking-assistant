import type { CatalogIngredientRef } from "types/catalogIngredientRef";

export interface Ingredient extends CatalogIngredientRef {
    id: number;
    name: string;
    category: string;
    unit_name: string;
    allergens: string[];
    days_to_expire: number | null;
    calories_per_unit: number | null;
}
