import type {
    Purchase,
    SaveUserIngredientsRequest,
    UpdatePurchaseRequest,
    UpdateQuantitiesRequest,
    UserIngredient,
} from "types/userIngredient";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";
import { listTag } from "./cacheTags";

// the pantry (and its purchase history) share one Pantry tag: any pantry write invalidates the lot, so open pantry/history views refetch automatically.
// pantry writes also invalidate the recipe list tag: the recipe list's "in my pantry" filter depends on pantry contents, so a stocked/removed ingredient must refetch it too
const PANTRY_INVALIDATES = ["Pantry", listTag("Recipe")] as const;

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
        updateQuantities: build.mutation<null, UpdateQuantitiesRequest>({
            query: (body) => ({
                url: API_ROUTES.userIngredients.updateQuantities,
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
