export interface RecipeFilters {
    ingredient_ids?: string;
    type_ids?: string;
    start_date?: string;
    end_date?: string;
    min_cooking_time?: number;
    max_cooking_time?: number;
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
    type_name: string | null;
    ingredients: unknown;
}
