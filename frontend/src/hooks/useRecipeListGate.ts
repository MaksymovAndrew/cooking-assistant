import type { RecipeFilterParams } from "types/recipe";

import { useGetUserIngredientsQuery } from "redux/services/userIngredientsApi";

import { useViewerFilterGate } from "hooks/useViewerFilterGate";

import type { RecipeFilterState } from "utils/filters/recipeFilterDefs";

import {
    hasViewerOnlyFilter,
    isPantryFilterEmpty,
} from "./recipeListViewHelpers";

interface RecipeListGate {
    queryParams: RecipeFilterParams;
    isHeldBack: boolean;
    isPantryEmpty: boolean;
}

export const useRecipeListGate = (
    filters: RecipeFilterState,
    params: RecipeFilterParams,
): RecipeListGate => {
    const { isAuthed, isAwaitingSession } = useViewerFilterGate(
        hasViewerOnlyFilter(filters),
    );
    // skipped until authed: a 401 during the session check would trip the global auth redirect
    const {
        data: pantry = [],
        isLoading: isPantryLoading,
        isUninitialized: isPantryUninitialized,
    } = useGetUserIngredientsQuery(null, { skip: !isAuthed });
    const isPantryEmpty = isPantryFilterEmpty(
        filters.inPantry,
        pantry.length,
        isPantryLoading,
        isPantryUninitialized,
    );

    // dropped for a guest: the skipped pantry query can't gate them, and the backend answers a 400
    const queryParams = isAuthed
        ? params
        : {
              ...params,
              in_pantry: undefined,
              favourites: undefined,
              hide_avoided: undefined,
              tag_ids: undefined,
          };

    return {
        queryParams,
        isHeldBack: isPantryEmpty || isAwaitingSession,
        isPantryEmpty,
    };
};
