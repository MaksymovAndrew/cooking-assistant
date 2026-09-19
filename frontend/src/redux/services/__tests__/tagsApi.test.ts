import { API_ROUTES } from "api/endpoints";

import { tagsApi } from "redux/services/tagsApi";

import {
    mockedDelete,
    mockedGet,
    mockedPatch,
    mockedPost,
    mockedPut,
} from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const TAG = { id: 3, name: "Weeknight" };

describe("tagsApi", () => {
    it("should fetch the user's tags", async () => {
        mockedGet.mockResolvedValue({ data: [TAG] });
        const store = makeTestStore();

        await store.dispatch(tagsApi.endpoints.getTags.initiate(null));

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.tags.list, {
            params: undefined,
        });
        expect(
            tagsApi.endpoints.getTags.select(null)(store.getState()).data,
        ).toEqual([TAG]);
    });

    it("should create a tag by name", async () => {
        mockedPost.mockResolvedValue({ data: TAG });
        const store = makeTestStore();

        const result = await store.dispatch(
            tagsApi.endpoints.createTag.initiate(TAG.name),
        );

        expect(mockedPost).toHaveBeenCalledWith(API_ROUTES.tags.list, {
            name: TAG.name,
        });
        expect(result.data).toEqual(TAG);
    });

    it("should rename and delete a tag", async () => {
        mockedPatch.mockResolvedValue({ data: null });
        mockedDelete.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            tagsApi.endpoints.renameTag.initiate({
                id: TAG.id,
                name: "Fast",
            }),
        );
        await store.dispatch(tagsApi.endpoints.deleteTag.initiate(TAG.id));

        expect(mockedPatch).toHaveBeenCalledWith(API_ROUTES.tags.byId(TAG.id), {
            name: "Fast",
        });
        expect(mockedDelete).toHaveBeenCalledWith(
            API_ROUTES.tags.byId(TAG.id),
            { data: undefined, params: undefined },
        );
    });

    it("should replace the tags of a recipe", async () => {
        mockedPut.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            tagsApi.endpoints.setRecipeTags.initiate({
                recipeId: 4,
                tagIds: [TAG.id],
            }),
        );

        expect(mockedPut).toHaveBeenCalledWith(API_ROUTES.recipes.tags(4), {
            tag_ids: [TAG.id],
        });
    });
});
