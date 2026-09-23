import type { AllergenSlug } from "constants/allergens";
import type { DietPreferences } from "types/dietPreferences";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";
import {
    patchAllergens,
    patchIngredients,
    withAdded,
    without,
} from "./dietPreferencesApi.optimistic";
import { undoOnFailure } from "./undoOnFailure";

const DIET_PREFERENCES = "DietPreferences" as const;

// every recipe carries a per-viewer containsAvoided flag and lists rank by it, so a change refetches them all
const DIET_WRITE_TAGS = [DIET_PREFERENCES, "Recipe"] as const;

const updatePreferences = (recipe: (preferences: DietPreferences) => void) =>
    dietPreferencesApi.util.updateQueryData("getDietPreferences", null, recipe);

export const dietPreferencesApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getDietPreferences: build.query<DietPreferences, null>({
            query: () => ({ url: API_ROUTES.dietPreferences.get }),
            providesTags: [DIET_PREFERENCES],
        }),
        avoidAllergen: build.mutation<null, AllergenSlug>({
            query: (slug) => ({
                url: API_ROUTES.dietPreferences.allergen(slug),
                method: "PUT",
            }),
            invalidatesTags: [...DIET_WRITE_TAGS],
            onQueryStarted: async (slug, { dispatch, queryFulfilled }) => {
                await undoOnFailure(
                    dispatch(
                        updatePreferences(patchAllergens(slug, withAdded)),
                    ),
                    queryFulfilled,
                );
            },
        }),
        unavoidAllergen: build.mutation<null, AllergenSlug>({
            query: (slug) => ({
                url: API_ROUTES.dietPreferences.allergen(slug),
                method: "DELETE",
            }),
            invalidatesTags: [...DIET_WRITE_TAGS],
            onQueryStarted: async (slug, { dispatch, queryFulfilled }) => {
                await undoOnFailure(
                    dispatch(updatePreferences(patchAllergens(slug, without))),
                    queryFulfilled,
                );
            },
        }),
        avoidIngredient: build.mutation<null, number>({
            query: (id) => ({
                url: API_ROUTES.ingredients.avoid(id),
                method: "PUT",
            }),
            invalidatesTags: [...DIET_WRITE_TAGS],
            onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
                await undoOnFailure(
                    dispatch(
                        updatePreferences(patchIngredients(id, withAdded)),
                    ),
                    queryFulfilled,
                );
            },
        }),
        unavoidIngredient: build.mutation<null, number>({
            query: (id) => ({
                url: API_ROUTES.ingredients.avoid(id),
                method: "DELETE",
            }),
            invalidatesTags: [...DIET_WRITE_TAGS],
            onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
                await undoOnFailure(
                    dispatch(updatePreferences(patchIngredients(id, without))),
                    queryFulfilled,
                );
            },
        }),
    }),
});

export const {
    useGetDietPreferencesQuery,
    useAvoidAllergenMutation,
    useUnavoidAllergenMutation,
    useAvoidIngredientMutation,
    useUnavoidIngredientMutation,
} = dietPreferencesApi;
