import { FAVOURITE_TARGET } from "constants/favourites";

import { API_ROUTES } from "api/endpoints";

import { favouritesApi } from "redux/services/favouritesApi";
import { menusApi } from "redux/services/menusApi";
import { recipesApi } from "redux/services/recipesApi";

import { mockedDelete, mockedGet, mockedPut } from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const EMPTY_PAGE = { items: [], total: 0 };

describe("favouritesApi", () => {
    it("should favourite a recipe with a PUT to its favourite path", async () => {
        mockedPut.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            favouritesApi.endpoints.addFavourite.initiate({
                target: FAVOURITE_TARGET.recipe,
                id: 5,
            }),
        );

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.recipes.favourite(5),
            undefined,
        );
    });

    it("should unfavourite a menu with a DELETE to its favourite path", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            favouritesApi.endpoints.removeFavourite.initiate({
                target: FAVOURITE_TARGET.menu,
                id: 9,
            }),
        );

        expect(mockedDelete).toHaveBeenCalledWith(
            API_ROUTES.menu.favourite(9),
            {
                data: undefined,
                params: undefined,
            },
        );
    });

    it("should refetch cached recipe lists after a recipe favourite changes", async () => {
        mockedGet.mockResolvedValue({ data: EMPTY_PAGE });
        mockedPut.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            recipesApi.endpoints.getRecipesByFilters.initiate({
                favourites: true,
            }),
        );
        const callsAfterFirstFetch = mockedGet.mock.calls.length;

        await store.dispatch(
            favouritesApi.endpoints.addFavourite.initiate({
                target: FAVOURITE_TARGET.recipe,
                id: 5,
            }),
        );
        await store.dispatch(
            recipesApi.endpoints.getRecipesByFilters.initiate({
                favourites: true,
            }),
        );

        expect(mockedGet.mock.calls.length).toBeGreaterThan(
            callsAfterFirstFetch,
        );
    });

    it("should refetch cached menu lists after a menu favourite changes", async () => {
        mockedGet.mockResolvedValue({ data: EMPTY_PAGE });
        mockedDelete.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            menusApi.endpoints.getMenus.initiate({ favourites: true }),
        );
        const callsAfterFirstFetch = mockedGet.mock.calls.length;

        await store.dispatch(
            favouritesApi.endpoints.removeFavourite.initiate({
                target: FAVOURITE_TARGET.menu,
                id: 9,
            }),
        );
        await store.dispatch(
            menusApi.endpoints.getMenus.initiate({ favourites: true }),
        );

        expect(mockedGet.mock.calls.length).toBeGreaterThan(
            callsAfterFirstFetch,
        );
    });
});
