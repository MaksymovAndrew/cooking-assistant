import type { PhotoUploadResponse, RecordPhotoTarget } from "types/media";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";
import { listTag } from "./cacheTags";

export interface RecordPhotoArgs {
    target: RecordPhotoTarget;
    id: number;
}

export interface UploadRecordPhotoArgs extends RecordPhotoArgs {
    file: Blob;
}

const TAG_BY_TARGET = {
    recipe: "Recipe",
    menu: "Menu",
} as const satisfies Record<RecordPhotoTarget, string>;

const PATH_BY_TARGET = {
    recipe: API_ROUTES.recipes.photo,
    menu: API_ROUTES.menu.photo,
} satisfies Record<RecordPhotoTarget, (id: number) => string>;

const invalidateRecordPhoto = (
    _result: unknown,
    _error: unknown,
    { target, id }: RecordPhotoArgs,
) => [{ type: TAG_BY_TARGET[target], id }, listTag(TAG_BY_TARGET[target])];

// an author's avatar is shown on every record they own, so those refetch along with the profile;
// nothing is invalidated on error, since a refetched session would unmount the open profile modal
const invalidateAvatar = (_result: unknown, error: unknown) =>
    error ? [] : (["Me", "Recipe", "Menu"] as const);

// the body is the image itself: the server reads its bytes, so no multipart wrapping is needed
export const photosApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        uploadRecordPhoto: build.mutation<
            PhotoUploadResponse,
            UploadRecordPhotoArgs
        >({
            query: ({ target, id, file }) => ({
                url: PATH_BY_TARGET[target](id),
                method: "PUT",
                data: file,
            }),
            invalidatesTags: invalidateRecordPhoto,
        }),
        removeRecordPhoto: build.mutation<null, RecordPhotoArgs>({
            query: ({ target, id }) => ({
                url: PATH_BY_TARGET[target](id),
                method: "DELETE",
            }),
            invalidatesTags: invalidateRecordPhoto,
        }),
        uploadAvatarPhoto: build.mutation<PhotoUploadResponse, Blob>({
            query: (file) => ({
                url: API_ROUTES.auth.avatar,
                method: "PUT",
                data: file,
            }),
            invalidatesTags: invalidateAvatar,
        }),
        removeAvatarPhoto: build.mutation<null, null>({
            query: () => ({
                url: API_ROUTES.auth.avatar,
                method: "DELETE",
            }),
            invalidatesTags: invalidateAvatar,
        }),
    }),
});

export const {
    useUploadRecordPhotoMutation,
    useRemoveRecordPhotoMutation,
    useUploadAvatarPhotoMutation,
    useRemoveAvatarPhotoMutation,
} = photosApi;
