import type {
    Purchase,
    SaveUserIngredientsRequest,
    UpdatePurchaseRequest,
    UserIngredient,
} from "types/userIngredient";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";
import { listTag } from "./cacheTags";

// the "in my pantry" recipe filter and menus' missing ingredients both read the pantry
const PANTRY_INVALIDATES = ["Pantry", listTag("Recipe"), "Menu"] as const;

export const userIngredientsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getUserIngredients: build.query<UserIngredient[], null>({
            query: () => ({ url: API_ROUTES.userIngredients.list }),
            providesTags: ["Pantry"],
        }),
        getPurchaseHistory: build.query<Purchase[], number>({
            query: (ingredientId) => ({
                url: API_ROUTES.userIngredients.history(ingredientId),
            }),
            providesTags: ["Pantry"],
        }),
        saveUserIngredient: build.mutation<null, SaveUserIngredientsRequest>({
            query: (body) => ({
                url: API_ROUTES.userIngredients.list,
                method: "PUT",
                data: body,
            }),
            invalidatesTags: PANTRY_INVALIDATES,
        }),
        deleteUserIngredient: build.mutation<null, number>({
            query: (ingredientId) => ({
                url: API_ROUTES.userIngredients.item(ingredientId),
                method: "DELETE",
            }),
            invalidatesTags: PANTRY_INVALIDATES,
        }),
        updatePurchase: build.mutation<
            null,
            { purchaseId: number; body: UpdatePurchaseRequest }
        >({
            query: ({ purchaseId, body }) => ({
                url: API_ROUTES.userIngredients.history(purchaseId),
                method: "PUT",
                data: body,
            }),
            invalidatesTags: PANTRY_INVALIDATES,
        }),
        discardPurchases: build.mutation<{ discarded: number }, number[]>({
            query: (purchaseIds) => ({
                url: API_ROUTES.userIngredients.discard,
                method: "POST",
                data: { purchaseIds },
            }),
            invalidatesTags: PANTRY_INVALIDATES,
        }),
        deletePurchase: build.mutation<null, number>({
            query: (purchaseId) => ({
                url: API_ROUTES.userIngredients.history(purchaseId),
                method: "DELETE",
            }),
            invalidatesTags: PANTRY_INVALIDATES,
        }),
    }),
});

export const {
    useGetUserIngredientsQuery,
    useGetPurchaseHistoryQuery,
    useSaveUserIngredientMutation,
    useDeleteUserIngredientMutation,
    useUpdatePurchaseMutation,
    useDeletePurchaseMutation,
    useDiscardPurchasesMutation,
} = userIngredientsApi;
