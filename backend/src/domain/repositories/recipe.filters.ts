export interface RecipeFilters {
    recipe_name?: string;
    ingredient_ids?: string;
    type_ids?: string;
    start_date?: string;
    end_date?: string;
    min_cooking_time?: number;
    max_cooking_time?: number;
    min_calories?: number;
    max_calories?: number;
    sort_order?: "asc" | "desc";
    in_pantry?: boolean;
    limit?: number;
    offset?: number;
}

export interface RecipeSearchRow {
    id: number;
    title: string;
    content: string;
    person_id: number;
    type_id: number | null;
    creation_date: Date;
    cooking_time: number | null;
    calories_per_portion: number | null;
    type_name: string | null;
    ingredients: unknown;
}
