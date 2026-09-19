import type { Tag } from "types/tag";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";

const TAG = "Tag" as const;

// a recipe carries the viewer's own tags, so any tag write can change what a recipe or list shows
const TAG_WRITE_TAGS = [TAG, "Recipe"] as const;

export interface RenameTagRequest {
    id: number;
    name: string;
}

export interface SetRecipeTagsRequest {
    recipeId: number;
    tagIds: number[];
}

export const tagsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getTags: build.query<Tag[], null>({
            query: () => ({ url: API_ROUTES.tags.list }),
            providesTags: [TAG],
        }),
        createTag: build.mutation<Tag, string>({
            query: (name) => ({
                url: API_ROUTES.tags.list,
                method: "POST",
                data: { name },
            }),
            invalidatesTags: [TAG],
        }),
        renameTag: build.mutation<null, RenameTagRequest>({
            query: ({ id, name }) => ({
                url: API_ROUTES.tags.byId(id),
                method: "PATCH",
                data: { name },
            }),
            invalidatesTags: [...TAG_WRITE_TAGS],
        }),
        deleteTag: build.mutation<null, number>({
            query: (id) => ({
                url: API_ROUTES.tags.byId(id),
                method: "DELETE",
            }),
            invalidatesTags: [...TAG_WRITE_TAGS],
        }),
        setRecipeTags: build.mutation<null, SetRecipeTagsRequest>({
            query: ({ recipeId, tagIds }) => ({
                url: API_ROUTES.recipes.tags(recipeId),
                method: "PUT",
                data: { tag_ids: tagIds },
            }),
            invalidatesTags: ["Recipe"],
        }),
    }),
});

export const {
    useGetTagsQuery,
    useCreateTagMutation,
    useRenameTagMutation,
    useDeleteTagMutation,
    useSetRecipeTagsMutation,
} = tagsApi;
