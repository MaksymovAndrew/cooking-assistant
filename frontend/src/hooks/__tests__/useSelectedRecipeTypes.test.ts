import type { RecipeTypeSummary } from "types/recipeType";

import { API_ROUTES } from "api/endpoints";

import { recipeTypesApi } from "redux/services/recipeTypesApi";

import { useSelectedRecipeTypes } from "hooks/useSelectedRecipeTypes";

import { mockedGet, mockGetByUrl } from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

const SOUP: RecipeTypeSummary = {
    id: 1,
    type_name: "Soup",
    description: "Something warm",
};
const SALAD: RecipeTypeSummary = {
    id: 2,
    type_name: "Salad",
    description: "Something fresh",
};

describe("useSelectedRecipeTypes", () => {
    it("should describe and name the selected types", async () => {
        mockGetByUrl({ [API_ROUTES.recipeTypes.list]: [SOUP, SALAD] });

        const store = makeTestStore();

        await store.dispatch(
            recipeTypesApi.endpoints.getRecipeTypes.initiate({ ids: "1,2" }),
        );

        const { result } = renderHookWithStore(
            () => useSelectedRecipeTypes([1, 2]),
            store,
        );

        expect(result.current.descriptions).toEqual([SOUP, SALAD]);
        expect(result.current.typesHeader).toBe("Soup, Salad");
    });

    it("should leave out a returned type that is not selected", async () => {
        mockGetByUrl({ [API_ROUTES.recipeTypes.list]: [SOUP, SALAD] });

        const store = makeTestStore();

        await store.dispatch(
            recipeTypesApi.endpoints.getRecipeTypes.initiate({ ids: "2" }),
        );

        const { result } = renderHookWithStore(
            () => useSelectedRecipeTypes([2]),
            store,
        );

        expect(result.current.descriptions).toEqual([SALAD]);
    });

    it("should not ask the server when no type is selected", () => {
        const { result } = renderHookWithStore(() =>
            useSelectedRecipeTypes([]),
        );

        expect(result.current.descriptions).toEqual([]);
        expect(result.current.typesHeader).toBe("");
        expect(mockedGet).not.toHaveBeenCalled();
    });
});
