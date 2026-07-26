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
}

export interface RecipeDetailIngredient {
    id: number;
    slug: string;
    name: string;
    category: string;
    quantity_recipe_ingredients: number;
    unit_name: string;
    allergens: string[];
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
    servings: string | null;
    person_id: number;
    // computed by the backend (r.person_id = current user) so the client can gate Edit/Delete without decoding the session
    isOwner: boolean;
}

export interface RecipeFilterParams {
    ingredient_name: string;
    type_ids?: string;
    start_date?: string;
    end_date?: string;
    min_cooking_time?: string;
    max_cooking_time?: string;
    // omitted (not empty string - the backend enum-validates "asc"/"desc") falls back to creation_date DESC server-side
    sort_order?: string;
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
    servings: string | undefined;
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
    servings: string | undefined;
    ingredients: UpdateRecipeIngredient[];
}

export interface RecipeFormIngredient {
    id: number;
    name: string;
    quantity: number;
    unit_name: string;
}

export interface RecipeFormInitialValues {
    title: string;
    content: string;
    cookingHours: string;
    cookingMinutes: string;
    selectedTypeId: number | null;
    selectedIngredients: RecipeFormIngredient[];
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
