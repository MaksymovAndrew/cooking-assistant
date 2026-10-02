import type { Locale } from "constants/locales";

import type { RecordAuthor, RecordRating } from "./recordAuthor";

export interface MenuDetailRow extends RecordRating {
    id: number;
    title: string;
    menuContent: string | null;
    language: Locale;
    categoryName: string;
    category_id: number;
    photo_key: string | null;
    creation_date: Date;
    isOwner: boolean;
    isFavourite: boolean | null;
    author: RecordAuthor;
}

export interface MenuRecipeRow extends Omit<RecordRating, "myRating"> {
    recipe_id: number;
    title: string;
    content: string;
    language: Locale;
    type_id: number | null;
    creation_date: Date;
    cooking_time: number | null;
    calories_per_portion: number | null;
    type_name: string | null;
    photo_key: string | null;
    ingredients: string[];
}

// every requirement of a recipe, not only shortfalls: a stocked one carries missing_quantity 0
export interface MissingIngredient {
    ingredient_id: number;
    ingredient_slug: string;
    ingredient_name: string;
    needed_quantity: number;
    missing_quantity: number;
    unit_name: string;
    coefficient: number;
}

export interface MenuDetail {
    menu: MenuDetailRow;
    recipes: (MenuRecipeRow & { missingIngredients: MissingIngredient[] })[];
    allergens: string[];
}

export interface MenuStatsRow {
    id: number;
    title: string;
    categoryName: string;
    menuContent: string | null;
    recipe_count: number;
    total_cooking_time: number;
    total_calories: number | null;
}
