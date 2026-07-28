export interface Menu {
    id: number;
    title: string;
    categoryname: string;
    menucontent: string;
    recipe_count: number;
    // present on the browse/person list endpoints, absent from the unpaginated stats-only query - optional so it stays honest about which callers have it
    person_id?: number;
}

// shape returned by GET /api/menus (unpaginated) - the plain menu list plus each menu's recipe count/total cooking time, used for stats-page averages
export interface MenuWithStats extends Menu {
    total_cooking_time: number;
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
    missingIngredients?: MissingIngredient[];
}

export interface MenuDetails {
    menu: {
        id: number;
        title: string;
        categoryname: string;
        menucontent: string;
        category_id: number;
        personid?: number;
        isOwner: boolean;
    };
    recipes: MenuDetailRecipe[];
    // distinct allergen slugs across every recipe of the menu
    allergens: string[];
}

export interface MenuListParams {
    menu_name?: string;
    category_ids?: string;
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
