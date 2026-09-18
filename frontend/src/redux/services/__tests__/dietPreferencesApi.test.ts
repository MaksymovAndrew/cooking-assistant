import type { DietPreferences } from "types/dietPreferences";

import { API_ROUTES } from "api/endpoints";

import { dietPreferencesApi } from "redux/services/dietPreferencesApi";

import { mockedDelete, mockedGet, mockedPut } from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const loadPreferences = async (preferences: DietPreferences) => {
    mockedGet.mockResolvedValue({ data: preferences });
    const store = makeTestStore();

    await store.dispatch(
        dietPreferencesApi.endpoints.getDietPreferences.initiate(null),
    );

    return store;
};

const cachedPreferences = (store: ReturnType<typeof makeTestStore>) =>
    dietPreferencesApi.endpoints.getDietPreferences.select(null)(
        store.getState(),
    ).data;

describe("dietPreferencesApi", () => {
    it("should fetch what the user avoids", async () => {
        const store = await loadPreferences({
            allergens: ["milk"],
            ingredient_ids: [4],
        });

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.dietPreferences.get, {
            params: undefined,
        });
        expect(cachedPreferences(store)).toEqual({
            allergens: ["milk"],
            ingredient_ids: [4],
        });
    });

    it("should mark an allergen as avoided at once, before the request settles", async () => {
        const store = await loadPreferences({
            allergens: [],
            ingredient_ids: [],
        });

        mockedPut.mockResolvedValue({ data: null });
        const request = store.dispatch(
            dietPreferencesApi.endpoints.avoidAllergen.initiate("gluten"),
        );

        expect(cachedPreferences(store)?.allergens).toEqual(["gluten"]);

        await request;

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.dietPreferences.allergen("gluten"),
            undefined,
        );
    });

    it("should put an allergen back when un-avoiding it fails", async () => {
        const store = await loadPreferences({
            allergens: ["milk", "eggs"],
            ingredient_ids: [],
        });

        mockedDelete.mockRejectedValue(new Error("offline"));
        await store.dispatch(
            dietPreferencesApi.endpoints.unavoidAllergen.initiate("milk"),
        );

        expect(cachedPreferences(store)?.allergens).toEqual(["milk", "eggs"]);
    });

    it("should add and remove an avoided ingredient in the cache", async () => {
        const store = await loadPreferences({
            allergens: [],
            ingredient_ids: [3],
        });

        mockedPut.mockResolvedValue({ data: null });
        mockedDelete.mockResolvedValue({ data: null });
        const added = store.dispatch(
            dietPreferencesApi.endpoints.avoidIngredient.initiate(8),
        );

        expect(cachedPreferences(store)?.ingredient_ids).toEqual([3, 8]);

        const removed = store.dispatch(
            dietPreferencesApi.endpoints.unavoidIngredient.initiate(3),
        );

        expect(cachedPreferences(store)?.ingredient_ids).toEqual([8]);

        await added;
        await removed;

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.ingredients.avoid(8),
            undefined,
        );
        expect(mockedDelete).toHaveBeenCalledWith(
            API_ROUTES.ingredients.avoid(3),
            { data: undefined, params: undefined },
        );
    });

    it("should not list an ingredient twice when it is avoided again", async () => {
        const store = await loadPreferences({
            allergens: [],
            ingredient_ids: [3],
        });

        mockedPut.mockResolvedValue({ data: null });
        const request = store.dispatch(
            dietPreferencesApi.endpoints.avoidIngredient.initiate(3),
        );

        expect(cachedPreferences(store)?.ingredient_ids).toEqual([3]);

        await request;
    });
});
