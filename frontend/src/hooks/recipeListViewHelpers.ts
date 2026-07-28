// text was typed but it matches no catalog ingredient - the caller skips the request entirely
// rather than sending one that would just come back empty
export const hasUnmatchedIngredientSearch = (
    ingredientName: string | null,
    matchedIngredientIds: string | undefined,
): boolean => Boolean(ingredientName?.trim()) && !matchedIngredientIds;

// the "in my pantry" filter has nothing to search against once the pantry itself is empty -
// the caller shows a dedicated empty state instead of sending a request that always returns zero
export const isPantryFilterEmpty = (
    inPantry: boolean,
    pantryCount: number,
): boolean => inPantry && pantryCount === 0;

// either dead end skips the request entirely rather than sending one that would just come back empty
export const shouldSkipRecipesRequest = (
    hasUnmatchedSearch: boolean,
    isPantryEmpty: boolean,
): boolean => hasUnmatchedSearch || isPantryEmpty;

export const isRecipeListEmpty = (
    hasUnmatchedSearch: boolean,
    isPantryEmpty: boolean,
    isSuccess: boolean,
    hasLoadedRecipes: boolean,
): boolean =>
    hasUnmatchedSearch || isPantryEmpty || (isSuccess && !hasLoadedRecipes);
