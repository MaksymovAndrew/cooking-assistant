import type { Locale } from "constants/locales";

import type { RecordAuthor, RecordRating } from "./recordAuthor";

export interface RecipeRow {
    id: number;
    title: string;
    content: string;
    language: Locale;
    person_id: number;
    type_id: number | null;
    creation_date: Date;
    cooking_time: number | null;
    calories_override: number | null;
    calories_computed: number | null;
    photo_key: string | null;
}

export interface RecipeTag {
    id: number;
    name: string;
}

export interface RecipeDetailIngredient {
    id: number;
    slug: string;
    name: string;
    category: string;
    quantity_recipe_ingredients: number;
    unit_name: string;
    allergens: string[];
    calories_per_unit: number | null;
}

export interface RecipeDetailRow extends RecordRating {
    id: number;
    title: string;
    content: string;
    language: Locale;
    type_id: number | null;
    creation_date: Date;
    cooking_time: number | null;
    calories_override: number | null;
    calories_computed: number | null;
    type_name: string | null;
    ingredients: RecipeDetailIngredient[];
    isOwner: boolean;
    isFavourite: boolean | null;
    containsAvoided: boolean | null;
    tags: RecipeTag[] | null;
    calories_per_portion: number | null;
    photo_key: string | null;
    author: RecordAuthor;
}
