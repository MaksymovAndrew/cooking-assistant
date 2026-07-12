import type {
    Purchase,
    SaveUserIngredientsRequest,
    UpdatePurchaseRequest,
    UpdateQuantitiesRequest,
    UserIngredient,
} from "types/userIngredient";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";

// the pantry (and its purchase history) share one Pantry tag: any pantry write invalidates the lot, so open pantry/history views refetch automatically
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
            invalidatesTags: ["Pantry"],
        }),
        updateQuantities: build.mutation<null, UpdateQuantitiesRequest>({
            query: (body) => ({
                url: API_ROUTES.userIngredients.updateQuantities,
                method: "PUT",
                data: body,
            }),
            invalidatesTags: ["Pantry"],
        }),
        deleteUserIngredient: build.mutation<null, number>({
            query: (ingredientId) => ({
                url: API_ROUTES.userIngredients.item(ingredientId),
                method: "DELETE",
            }),
            invalidatesTags: ["Pantry"],
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
            invalidatesTags: ["Pantry"],
        }),
    }),
});

export const {
    useGetUserIngredientsQuery,
    useGetPurchaseHistoryQuery,
    useSaveUserIngredientMutation,
    useUpdateQuantitiesMutation,
    useDeleteUserIngredientMutation,
    useUpdatePurchaseMutation,
} = userIngredientsApi;
