export interface Ingredient {
    id: number;
    slug: string;
    name: string;
    category: string;
    unit_name: string;
    allergens: string[];
    days_to_expire: number | null;
    calories_per_unit: number | null;
}
