import { RATING_TARGET } from "constants/ratings";

import { API_ROUTES } from "api/endpoints";

import { menusApi } from "redux/services/menusApi";
import { ratingsApi } from "redux/services/ratingsApi";
import { recipesApi } from "redux/services/recipesApi";

import { mockedDelete, mockedGet, mockedPut } from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const EMPTY_PAGE = { items: [], total: 0 };

describe("ratingsApi", () => {
    it("should rate a recipe with a PUT carrying the value", async () => {
        mockedPut.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            ratingsApi.endpoints.rateRecord.initiate({
                target: RATING_TARGET.recipe,
                id: 5,
                value: 4,
            }),
        );

        expect(mockedPut).toHaveBeenCalledWith(API_ROUTES.recipes.rating(5), {
            value: 4,
        });
    });

    it("should remove a menu rating with a DELETE to its rating path", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            ratingsApi.endpoints.removeRating.initiate({
                target: RATING_TARGET.menu,
                id: 9,
            }),
        );

        expect(mockedDelete).toHaveBeenCalledWith(API_ROUTES.menu.rating(9), {
            data: undefined,
            params: undefined,
        });
    });

    it("should refetch a rating-sorted recipe list after a vote", async () => {
        mockedGet.mockResolvedValue({ data: EMPTY_PAGE });
        mockedPut.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            recipesApi.endpoints.getRecipesByFilters.initiate({
                sort_order: "rating",
            }),
        );
        const callsAfterFirstFetch = mockedGet.mock.calls.length;

        await store.dispatch(
            ratingsApi.endpoints.rateRecord.initiate({
                target: RATING_TARGET.recipe,
                id: 5,
                value: 5,
            }),
        );
        await store.dispatch(
            recipesApi.endpoints.getRecipesByFilters.initiate({
                sort_order: "rating",
            }),
        );

        expect(mockedGet.mock.calls.length).toBeGreaterThan(
            callsAfterFirstFetch,
        );
    });

    it("should refetch a top-rated menu list after a vote is taken back", async () => {
        mockedGet.mockResolvedValue({ data: EMPTY_PAGE });
        mockedDelete.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            menusApi.endpoints.getMenus.initiate({ top_rated: true }),
        );
        const callsAfterFirstFetch = mockedGet.mock.calls.length;

        await store.dispatch(
            ratingsApi.endpoints.removeRating.initiate({
                target: RATING_TARGET.menu,
                id: 9,
            }),
        );
        await store.dispatch(
            menusApi.endpoints.getMenus.initiate({ top_rated: true }),
        );

        expect(mockedGet.mock.calls.length).toBeGreaterThan(
            callsAfterFirstFetch,
        );
    });
});
