import type { AllergenSlug } from "constants/allergens";
import type { Locale } from "constants/locales";

import type { RecordAuthor, RecordRating } from "./recordAuthor";

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
    // asc/desc order by cooking time
    sort_order?: "asc" | "desc" | "rating";
    top_rated?: boolean;
    in_pantry?: boolean;
    favourites?: boolean;
    exclude_allergens?: AllergenSlug[];
    hide_avoided?: boolean;
    tag_ids?: string;
    languages?: Locale[];
    limit?: number;
    offset?: number;
}

export interface RecipeSearchRow extends RecordRating {
    id: number;
    title: string;
    content: string;
    language: Locale;
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
    photo_key: string | null;
    author: RecordAuthor;
}
