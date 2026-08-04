import type { CatalogIngredientRef } from "types/catalogIngredientRef";

export interface RecipeListItem {
    id: number;
    title: string;
    type_name: string;
    creation_date: string;
    cooking_time: number;
    // present on the search/person-filtered endpoints, absent from the unpaginated stats-only query - optional so it stays honest about which callers have it
    person_id?: number;
}

// shape returned by GET /api/recipes - the recipe list plus an array_agg of ingredient names
export interface RecipeWithIngredientNames extends RecipeListItem {
    ingredients: string[];
}

export interface RecipeSearchIngredient {
    id: number;
    name: string;
    allergens: string[];
}

// shape returned by GET /api/recipes-by-filters and /api/recipes-filters-person/:id (different ingredient shape from RecipeWithIngredientNames)
export interface RecipeSearchResultItem extends RecipeListItem {
    ingredients: RecipeSearchIngredient[];
    // COALESCE(calories_override, calories_computed)
    calories_per_portion: number | null;
}

export interface RecipeDetailIngredient extends CatalogIngredientRef {
    id: number;
    name: string;
    category: string;
    quantity_recipe_ingredients: number;
    unit_name: string;
    allergens: string[];
    calories_per_unit: number | null;
}

// shape returned by GET /api/recipe/:id (superset of what RecipeDetailsPage + ChangeRecipePage use)
export interface RecipeDetails {
    id: number;
    title: string;
    content: string;
    ingredients: RecipeDetailIngredient[];
    type_id: number;
    type_name: string;
    cooking_time: number;
    creation_date: string;
    person_id: number;
    // computed by the backend (r.person_id = current user) so the client can gate Edit/Delete without decoding the session
    isOwner: boolean;
    // COALESCE(calories_override, calories_computed)
    calories_per_portion: number | null;
    // the author's manual value; null means the total above is auto-computed from the ingredients
    calories_override: number | null;
}

export interface RecipeFilterParams {
    recipe_name?: string;
    ingredient_ids?: string;
    type_ids?: string;
    start_date?: string;
    end_date?: string;
    min_cooking_time?: string;
    max_cooking_time?: string;
    min_calories?: string;
    max_calories?: string;
    // omitted (not empty string - the backend enum-validates "asc"/"desc") falls back to creation_date DESC server-side
    sort_order?: string;
    in_pantry?: boolean;
}

export interface CreateRecipeIngredient {
    id: number;
    quantity: number;
}

export interface CreateRecipeRequest {
    title: string;
    content: string;
    ingredients: CreateRecipeIngredient[];
    type_id: number | null;
    cooking_time: number;
    calories_override: number | null;
}

export interface UpdateRecipeIngredient {
    id: number;
    quantity_recipe_ingredients: number;
}

export interface UpdateRecipeRequest {
    title: string;
    content: string;
    type_id: number | null;
    cooking_time: number;
    calories_override: number | null;
    ingredients: UpdateRecipeIngredient[];
}

export interface RecipeFormIngredient extends CatalogIngredientRef {
    id: number;
    name: string;
    quantity: number;
    unit_name: string;
    calories_per_unit: number | null;
}

export interface RecipeFormInitialValues {
    title: string;
    content: string;
    cookingHours: string;
    cookingMinutes: string;
    selectedTypeId: number | null;
    selectedIngredients: RecipeFormIngredient[];
    // text state, empty means "compute automatically"; matches cookingHours/cookingMinutes's convention of staying a string until submit
    caloriesOverride: string;
}

export interface RecipeFormCreateMessages {
    errorTitle: string;
    errorDescription: string;
    errorIngredients: string;
    errorType: string;
    errorCookingTimeFormat: string;
    errorCookingTimeInvalid: string;
}

export interface RecipeFormChangeMessages {
    errorCookingTimeFormat: string;
    errorCookingTimeInvalid: string;
}
