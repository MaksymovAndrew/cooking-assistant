import type { RecipeListItem } from "types/recipe";

import { recipesApi } from "redux/services/recipesApi";

import { useRecipePickerSearch } from "hooks/useRecipePickerSearch";

import { mockedGet } from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

const recipe = (id: number): RecipeListItem => ({
    id,
    title: `Soup ${id}`,
    type_name: null,
    creation_date: "2026-01-01",
    cooking_time: 10,
});

describe("useRecipePickerSearch", () => {
    it("should not ask the server while the query is empty", () => {
        const { result } = renderHookWithStore(() =>
            useRecipePickerSearch("", []),
        );

        expect(mockedGet).not.toHaveBeenCalled();
        expect(result.current.matches).toEqual([]);
    });

    it("should return the found recipes the menu does not hold yet", async () => {
        mockedGet.mockResolvedValue({
            data: { items: [recipe(1), recipe(2)], total: 2 },
        });

        const store = makeTestStore();

        // the cache is filled first, so the hook reads a finished search
        await store.dispatch(
            recipesApi.endpoints.getRecipesByFilters.initiate({
                recipe_name: "soup",
            }),
        );

        const { result } = renderHookWithStore(
            () => useRecipePickerSearch("soup", [1]),
            store,
        );

        expect(result.current.matches).toEqual([recipe(2)]);
        expect(result.current.hasMore).toBe(false);
    });
});
