import type { CookRecordRequest, CookSummary } from "types/pantryConsumption";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";
import { listTag } from "./cacheTags";

// cooking and its undo move pantry stock, the "in my pantry" recipe filter, a menu's missing
// ingredients and possibly the calorie diary all at once
const COOKING_INVALIDATES = [
    "Pantry",
    listTag("Recipe"),
    "Menu",
    "Calories",
] as const;

export const pantryConsumptionApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        cookRecord: build.mutation<CookSummary, CookRecordRequest>({
            query: (data) => ({
                url: API_ROUTES.userIngredients.cook,
                method: "POST",
                data,
            }),
            invalidatesTags: COOKING_INVALIDATES,
        }),
        undoCooking: build.mutation<null, number>({
            query: (consumptionId) => ({
                url: API_ROUTES.userIngredients.undoCook(consumptionId),
                method: "POST",
            }),
            invalidatesTags: COOKING_INVALIDATES,
        }),
    }),
});

export const { useCookRecordMutation, useUndoCookingMutation } =
    pantryConsumptionApi;
