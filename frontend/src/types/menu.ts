import type { RecordAuthor } from "types/media";

export interface Menu {
    id: number;
    title: string;
    categoryname: string;
    menucontent: string;
    recipe_count: number;
    // computed by the backend (m.person_id = current viewer) - present on the browse/person list
    // endpoints, absent from the unpaginated stats-only query, optional so it stays honest about
    // which callers have it. The raw person_id itself never leaves the server.
    isOwner?: boolean;
    // per viewer, like isOwner - null when the request carried no session
    isFavourite?: boolean | null;
    // present on the browse/person lists only, like isOwner
    photo_key?: string | null;
    author?: RecordAuthor;
}

// shape returned by GET /api/menus (unpaginated) - the plain menu list plus each menu's recipe
// count/total cooking time/total calories, used for stats-page averages. total_calories is null
// (not a silently undercounted number) once any of the menu's recipes lacks calorie data - same
// rule PgCalorieRepository.findMenuCalories already uses for a single menu
export interface MenuWithStats extends Menu {
    total_cooking_time: number;
    total_calories: number | null;
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

export interface MenuDetailRecipe {
    recipe_id: number;
    title: string;
    type_name: string;
    cooking_time: number;
    creation_date: string;
    // COALESCE(calories_override, calories_computed)
    calories_per_portion: number | null;
    photo_key: string | null;
    missingIngredients?: MissingIngredient[];
}

export interface MenuDetails {
    menu: {
        id: number;
        title: string;
        // a menu row may carry no category: the column is nullable
        categoryname: string | null;
        menucontent: string;
        category_id: number;
        isOwner: boolean;
        isFavourite: boolean | null;
        photo_key: string | null;
        author: RecordAuthor;
    };
    recipes: MenuDetailRecipe[];
    // distinct allergen slugs across every recipe of the menu
    allergens: string[];
}

export interface MenuListParams {
    menu_name?: string;
    category_ids?: string;
    favourites?: boolean;
}

export interface CreateMenuRequest {
    menuTitle: string;
    menuContent: string;
    categoryId: number;
    recipeIds: number[];
}

export interface UpdateMenuRequest {
    menuTitle: string;
    menuContent: string;
    categoryId: number | null;
    recipeIds: number[];
}
