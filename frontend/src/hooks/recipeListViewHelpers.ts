// the "in my pantry" filter has nothing to search against once the pantry itself is empty - the
// caller shows a dedicated empty state instead. Gated on the pantry query's own loading state so a
// cold-cache visit (pantry still defaults to []) doesn't read as "pantry is empty" before the real
// count arrives
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

// the filters that need a session: the controls setting them are hidden from a guest, so one left
// in the URL is a stale bookmark or an expired session
export const hasViewerOnlyFilter = (filters: {
    favourites: boolean;
    hideAvoided: boolean;
    tags: number[];
}): boolean =>
    filters.favourites || filters.hideAvoided || filters.tags.length > 0;
