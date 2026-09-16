import type { FavouriteTarget } from "constants/favourites";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";
import { listTag } from "./cacheTags";

export interface FavouriteArgs {
    target: FavouriteTarget;
    id: number;
}

const TAG_BY_TARGET = {
    recipe: "Recipe",
    menu: "Menu",
} as const satisfies Record<FavouriteTarget, string>;

const PATH_BY_TARGET = {
    recipe: API_ROUTES.recipes.favourite,
    menu: API_ROUTES.menu.favourite,
} satisfies Record<FavouriteTarget, (id: number) => string>;

// the record's own tag refetches every cached list that holds it, and the LIST tag a favourites-filtered
// list that doesn't hold it yet
const invalidateFavourite = (
    _result: unknown,
    _error: unknown,
    { target, id }: FavouriteArgs,
) => [{ type: TAG_BY_TARGET[target], id }, listTag(TAG_BY_TARGET[target])];

export const favouritesApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        addFavourite: build.mutation<null, FavouriteArgs>({
            query: ({ target, id }) => ({
                url: PATH_BY_TARGET[target](id),
                method: "PUT",
            }),
            invalidatesTags: invalidateFavourite,
        }),
        removeFavourite: build.mutation<null, FavouriteArgs>({
            query: ({ target, id }) => ({
                url: PATH_BY_TARGET[target](id),
                method: "DELETE",
            }),
            invalidatesTags: invalidateFavourite,
        }),
    }),
});

export const { useAddFavouriteMutation, useRemoveFavouriteMutation } =
    favouritesApi;
