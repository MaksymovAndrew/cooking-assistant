import type { AllergenSlug } from "constants/allergens";
import type { DietPreferences } from "types/dietPreferences";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";

const DIET_PREFERENCES = "DietPreferences" as const;

// every recipe carries a per-viewer containsAvoided flag and lists rank by it, so a change refetches them all
const DIET_WRITE_TAGS = [DIET_PREFERENCES, "Recipe"] as const;

const without = <T>(values: T[], value: T): T[] =>
    values.filter((entry) => entry !== value);

const withAdded = <T>(values: T[], value: T): T[] =>
    values.includes(value) ? values : [...values, value];

// optimistic: the chip flips on press and flips back if the request fails - the failure itself is
// toasted by the global listener
const undoOnFailure = async (
    patch: { undo: () => void },
    queryFulfilled: Promise<unknown>,
) => {
    try {
        await queryFulfilled;
    } catch {
        patch.undo();
    }
};

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
            onQueryStarted: async (
                slug,
                { dispatch, queryFulfilled },
            ): Promise<void> =>
                undoOnFailure(
                    dispatch(
                        updatePreferences((preferences) => {
                            preferences.allergens = withAdded(
                                preferences.allergens,
                                slug,
                            );
                        }),
                    ),
                    queryFulfilled,
                ),
        }),
        unavoidAllergen: build.mutation<null, AllergenSlug>({
            query: (slug) => ({
                url: API_ROUTES.dietPreferences.allergen(slug),
                method: "DELETE",
            }),
            invalidatesTags: [...DIET_WRITE_TAGS],
            onQueryStarted: async (
                slug,
                { dispatch, queryFulfilled },
            ): Promise<void> =>
                undoOnFailure(
                    dispatch(
                        updatePreferences((preferences) => {
                            preferences.allergens = without(
                                preferences.allergens,
                                slug,
                            );
                        }),
                    ),
                    queryFulfilled,
                ),
        }),
        avoidIngredient: build.mutation<null, number>({
            query: (id) => ({
                url: API_ROUTES.ingredients.avoid(id),
                method: "PUT",
            }),
            invalidatesTags: [...DIET_WRITE_TAGS],
            onQueryStarted: async (
                id,
                { dispatch, queryFulfilled },
            ): Promise<void> =>
                undoOnFailure(
                    dispatch(
                        updatePreferences((preferences) => {
                            preferences.ingredient_ids = withAdded(
                                preferences.ingredient_ids,
                                id,
                            );
                        }),
                    ),
                    queryFulfilled,
                ),
        }),
        unavoidIngredient: build.mutation<null, number>({
            query: (id) => ({
                url: API_ROUTES.ingredients.avoid(id),
                method: "DELETE",
            }),
            invalidatesTags: [...DIET_WRITE_TAGS],
            onQueryStarted: async (
                id,
                { dispatch, queryFulfilled },
            ): Promise<void> =>
                undoOnFailure(
                    dispatch(
                        updatePreferences((preferences) => {
                            preferences.ingredient_ids = without(
                                preferences.ingredient_ids,
                                id,
                            );
                        }),
                    ),
                    queryFulfilled,
                ),
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
