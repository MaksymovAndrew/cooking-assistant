import type { AllergenSlug } from "constants/allergens";

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
    favourites?: boolean;
    exclude_allergens?: AllergenSlug[];
    hide_avoided?: boolean;
    tag_ids?: string;
    limit?: number;
    offset?: number;
}

export interface RecipeSearchRow {
    id: number;
    title: string;
    content: string;
    isOwner: boolean;
    isFavourite: boolean | null;
    containsAvoided: boolean | null;
    tags: { id: number; name: string }[] | null;
    type_id: number | null;
    creation_date: Date;
    cooking_time: number | null;
    calories_per_portion: number | null;
    type_name: string | null;
    ingredients: unknown;
}
