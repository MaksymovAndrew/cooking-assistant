// gated on loading: a cold cache defaults the pantry to [], which must not read as empty
export const isPantryFilterEmpty = (
    inPantry: boolean,
    pantryCount: number,
    isPantryLoading: boolean,
    isPantryUninitialized: boolean,
): boolean =>
    inPantry && !isPantryLoading && !isPantryUninitialized && pantryCount === 0;

export const isRecipeListEmpty = (
    isPantryEmpty: boolean,
    isSuccess: boolean,
    hasLoadedRecipes: boolean,
): boolean => isPantryEmpty || (isSuccess && !hasLoadedRecipes);

// a guest never sees these controls, so one in the URL is a stale bookmark or an expired session
export const hasViewerOnlyFilter = (filters: {
    favourites: boolean;
    hideAvoided: boolean;
    tags: number[];
}): boolean =>
    filters.favourites || filters.hideAvoided || filters.tags.length > 0;
