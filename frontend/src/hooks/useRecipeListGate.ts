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

// decides what the list may actually ask the server for: a guest cannot use the
// viewer-only filters, and an empty pantry makes the in_pantry list pointless
export const useRecipeListGate = (
    filters: RecipeFilterState,
    params: RecipeFilterParams,
): RecipeListGate => {
    // skipped until the session is confirmed authed - not just "not yet known to be a guest" -
    // so this list stays reachable without a 401 tripping the global auth redirect on a page
    // that's public now, including during the initial checking window
    const { isAuthed, isAwaitingSession } = useViewerFilterGate(
        hasViewerOnlyFilter(filters),
    );
    // already fetched by the pantry page/home dashboard - a cache read, not a new request
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

    // a guest can't use in_pantry, favourites, hide_avoided or tag_ids (the controls that set them are hidden for them) - if one is still set
    // in the URL (a stale bookmark, or a session that expired mid-visit), isPantryUninitialized
    // never resolves since the pantry query itself stays skipped, so drop the filter here too
    // instead of sending a request the backend rejects with a 400
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
