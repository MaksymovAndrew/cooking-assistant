import type { Locale } from "constants/locales";
import type { RecordAuthor } from "types/media";
import type { RecordRating } from "types/rating";

export interface Menu {
    id: number;
    title: string;
    categoryName: string;
    menuContent: string;
    // the language the author wrote it in
    language?: Locale;
    recipe_count: number;
    // computed per viewer; the raw person_id never leaves the server
    isOwner?: boolean;
    // per viewer, like isOwner - null when the request carried no session
    isFavourite?: boolean | null;
    photo_key?: string | null;
    author?: RecordAuthor;
    ratingAverage?: number | null;
    ratingCount?: number;
    myRating?: number | null;
}

export interface MenuCategory {
    menu_category_id: number;
    category_name: string;
}

export interface MissingIngredient {
    ingredient_id: number;
    ingredient_slug: string;
    ingredient_name: string;
    needed_quantity: number;
    missing_quantity: number;
    unit_name: string;
}

export interface MenuDetailRecipe extends Omit<RecordRating, "myRating"> {
    recipe_id: number;
    title: string;
    language: Locale;
    type_name: string | null;
    cooking_time: number;
    creation_date: string;
    // COALESCE(calories_override, calories_computed)
    calories_per_portion: number | null;
    photo_key: string | null;
    missingIngredients?: MissingIngredient[];
}

export interface MenuDetails {
    menu: RecordRating & {
        id: number;
        title: string;
        categoryName: string | null;
        menuContent: string;
        language: Locale;
        category_id: number;
        isOwner: boolean;
        isFavourite: boolean | null;
        photo_key: string | null;
        creation_date: string;
        author: RecordAuthor;
    };
    recipes: MenuDetailRecipe[];
    allergens: string[];
}

export interface MenuListParams {
    menu_name?: string;
    category_ids?: string;
    favourites?: boolean;
    sort_order?: "rating";
    top_rated?: boolean;
    // comma-separated language codes
    languages?: string;
}

export interface CreateMenuRequest {
    menuTitle: string;
    menuContent: string;
    language: Locale;
    categoryId: number;
    recipeIds: number[];
}

export interface UpdateMenuRequest {
    menuTitle: string;
    menuContent: string;
    language: Locale;
    categoryId: number | null;
    recipeIds: number[];
}
