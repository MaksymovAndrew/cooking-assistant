import type {
    AddIngredientsToShoppingListRequest,
    AddShoppingListItemRequest,
    ReorderShoppingListRequest,
    ShoppingListItem,
    UpdateShoppingListItemRequest,
} from "types/shoppingList";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";

const SHOPPING_LIST = "ShoppingList" as const;

export const shoppingListApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getShoppingList: build.query<ShoppingListItem[], null>({
            query: () => ({ url: API_ROUTES.shoppingList.list }),
            providesTags: [SHOPPING_LIST],
        }),
        addShoppingListItem: build.mutation<
            ShoppingListItem,
            AddShoppingListItemRequest
        >({
            query: (data) => ({
                url: API_ROUTES.shoppingList.list,
                method: "POST",
                data,
            }),
            invalidatesTags: [SHOPPING_LIST],
        }),
        addIngredientsToShoppingList: build.mutation<
            null,
            AddIngredientsToShoppingListRequest
        >({
            query: (data) => ({
                url: API_ROUTES.shoppingList.ingredients,
                method: "POST",
                data,
            }),
            invalidatesTags: [SHOPPING_LIST],
        }),
        // optimistic: the box ticks on press and unticks if the request fails. The refetch that follows either way
        // replaces anything a list refetch overlapping the request brought back from before it
        setShoppingListItemChecked: build.mutation<
            ShoppingListItem,
            UpdateShoppingListItemRequest
        >({
            query: ({ id, checked }) => ({
                url: API_ROUTES.shoppingList.byId(id),
                method: "PATCH",
                data: { checked },
            }),
            invalidatesTags: [SHOPPING_LIST],
            onQueryStarted: async (
                { id, checked },
                { dispatch, queryFulfilled },
            ) => {
                const patch = dispatch(
                    shoppingListApi.util.updateQueryData(
                        "getShoppingList",
                        null,
                        (items) => {
                            const item = items.find((entry) => entry.id === id);

                            if (item) {
                                item.checked = checked;
                            }
                        },
                    ),
                );

                try {
                    await queryFulfilled;
                } catch {
                    patch.undo();
                }
            },
        }),
        deleteShoppingListItem: build.mutation<null, number>({
            query: (id) => ({
                url: API_ROUTES.shoppingList.byId(id),
                method: "DELETE",
            }),
            invalidatesTags: [SHOPPING_LIST],
        }),
        clearCheckedShoppingListItems: build.mutation<null, null>({
            query: () => ({
                url: API_ROUTES.shoppingList.checked,
                method: "DELETE",
            }),
            invalidatesTags: [SHOPPING_LIST],
        }),
        // optimistic too, with the same refetch; a failure usually means the list changed elsewhere
        reorderShoppingList: build.mutation<null, ReorderShoppingListRequest>({
            query: (data) => ({
                url: API_ROUTES.shoppingList.order,
                method: "PUT",
                data,
            }),
            invalidatesTags: [SHOPPING_LIST],
            onQueryStarted: async ({ ids }, { dispatch, queryFulfilled }) => {
                const patch = dispatch(
                    shoppingListApi.util.updateQueryData(
                        "getShoppingList",
                        null,
                        (items) => {
                            items.sort(
                                (a, b) => ids.indexOf(a.id) - ids.indexOf(b.id),
                            );
                        },
                    ),
                );

                try {
                    await queryFulfilled;
                } catch {
                    patch.undo();
                }
            },
        }),
    }),
});

export const {
    useGetShoppingListQuery,
    useAddShoppingListItemMutation,
    useAddIngredientsToShoppingListMutation,
    useSetShoppingListItemCheckedMutation,
    useDeleteShoppingListItemMutation,
    useClearCheckedShoppingListItemsMutation,
    useReorderShoppingListMutation,
} = shoppingListApi;
