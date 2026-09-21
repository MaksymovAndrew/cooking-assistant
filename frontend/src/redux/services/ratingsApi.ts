import type { RatingTarget } from "types/rating";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";
import { listTag } from "./cacheTags";

export interface RatingArgs {
    target: RatingTarget;
    id: number;
}

export interface RateArgs extends RatingArgs {
    value: number;
}

const TAG_BY_TARGET = {
    recipe: "Recipe",
    menu: "Menu",
} as const satisfies Record<RatingTarget, string>;

const PATH_BY_TARGET = {
    recipe: API_ROUTES.recipes.rating,
    menu: API_ROUTES.menu.rating,
} satisfies Record<RatingTarget, (id: number) => string>;

// the record's own tag refetches every cached list that holds it, and the LIST tag re-ranks a
// rating-sorted list or a top-rated one the record has just entered
const invalidateRating = (
    _result: unknown,
    _error: unknown,
    { target, id }: RatingArgs,
) => [{ type: TAG_BY_TARGET[target], id }, listTag(TAG_BY_TARGET[target])];

export const ratingsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        rateRecord: build.mutation<null, RateArgs>({
            query: ({ target, id, value }) => ({
                url: PATH_BY_TARGET[target](id),
                method: "PUT",
                data: { value },
            }),
            invalidatesTags: invalidateRating,
        }),
        removeRating: build.mutation<null, RatingArgs>({
            query: ({ target, id }) => ({
                url: PATH_BY_TARGET[target](id),
                method: "DELETE",
            }),
            invalidatesTags: invalidateRating,
        }),
    }),
});

export const { useRateRecordMutation, useRemoveRatingMutation } = ratingsApi;
