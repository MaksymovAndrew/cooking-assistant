import { API_ROUTES } from "api/endpoints";

import { authApi } from "redux/services/authApi";
import { menusApi } from "redux/services/menusApi";
import { photosApi } from "redux/services/photosApi";
import { recipesApi } from "redux/services/recipesApi";

import { mockedDelete, mockedGet, mockedPut } from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const PHOTO = new Blob(["image-bytes"], { type: "image/png" });
const UPLOADED = { photo_key: "0b8f5a3e-2c4d-4e6f-8a1b-3c5d7e9f1a2b" };

describe("photosApi", () => {
    it("should upload a recipe photo as the raw request body", async () => {
        mockedPut.mockResolvedValue({ data: UPLOADED });
        const store = makeTestStore();

        const result = await store.dispatch(
            photosApi.endpoints.uploadRecordPhoto.initiate({
                target: "recipe",
                id: 5,
                file: PHOTO,
            }),
        );

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.recipes.photo(5),
            PHOTO,
        );
        expect(result.data).toEqual(UPLOADED);
    });

    it("should remove a menu photo with a DELETE to its photo path", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            photosApi.endpoints.removeRecordPhoto.initiate({
                target: "menu",
                id: 9,
            }),
        );

        expect(mockedDelete).toHaveBeenCalledWith(API_ROUTES.menu.photo(9), {
            data: undefined,
            params: undefined,
        });
    });

    it("should refetch the recipe after its photo changes", async () => {
        mockedGet.mockResolvedValue({ data: { id: 5 } });
        mockedPut.mockResolvedValue({ data: UPLOADED });
        const store = makeTestStore();

        const subscription = store.dispatch(
            recipesApi.endpoints.getRecipeById.initiate("5"),
        );

        await subscription;
        const callsAfterFirstFetch = mockedGet.mock.calls.length;

        await store.dispatch(
            photosApi.endpoints.uploadRecordPhoto.initiate({
                target: "recipe",
                id: 5,
                file: PHOTO,
            }),
        );
        await store.dispatch(recipesApi.endpoints.getRecipeById.initiate("5"));

        expect(mockedGet.mock.calls.length).toBeGreaterThan(
            callsAfterFirstFetch,
        );
        subscription.unsubscribe();
    });

    it("should upload an avatar photo to the current user's avatar path", async () => {
        mockedPut.mockResolvedValue({ data: UPLOADED });
        const store = makeTestStore();

        await store.dispatch(
            photosApi.endpoints.uploadAvatarPhoto.initiate(PHOTO),
        );

        expect(mockedPut).toHaveBeenCalledWith(API_ROUTES.auth.avatar, PHOTO);
    });

    it("should remove the avatar photo with a DELETE to the avatar path", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            photosApi.endpoints.removeAvatarPhoto.initiate(null),
        );

        expect(mockedDelete).toHaveBeenCalledWith(API_ROUTES.auth.avatar, {
            data: undefined,
            params: undefined,
        });
    });

    it("should refetch the current user and their menus after the avatar changes", async () => {
        mockedGet.mockResolvedValue({ data: null });
        mockedPut.mockResolvedValue({ data: UPLOADED });
        const store = makeTestStore();

        const me = store.dispatch(authApi.endpoints.getMe.initiate(null));
        const menus = store.dispatch(
            menusApi.endpoints.getAllMenus.initiate(null),
        );

        await Promise.all([me, menus]);
        mockedGet.mockClear();

        await store.dispatch(
            photosApi.endpoints.uploadAvatarPhoto.initiate(PHOTO),
        );
        await Promise.all([
            store.dispatch(authApi.endpoints.getMe.initiate(null)),
            store.dispatch(menusApi.endpoints.getAllMenus.initiate(null)),
        ]);

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.auth.me, {
            params: undefined,
        });
        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.menu.allUnpaginated, {
            params: undefined,
        });
        me.unsubscribe();
        menus.unsubscribe();
    });

    it("should leave the current user cached when the avatar upload fails", async () => {
        mockedGet.mockResolvedValue({ data: null });
        mockedPut.mockRejectedValue(new Error("upload failed"));
        const store = makeTestStore();

        const me = store.dispatch(authApi.endpoints.getMe.initiate(null));

        await me;
        mockedGet.mockClear();

        await store.dispatch(
            photosApi.endpoints.uploadAvatarPhoto.initiate(PHOTO),
        );
        await store.dispatch(authApi.endpoints.getMe.initiate(null));

        expect(mockedGet).not.toHaveBeenCalled();
        me.unsubscribe();
    });
});
