import { act } from "@testing-library/react";

import { PAGE_SIZE } from "constants/pagination";
import type { Menu } from "types/menu";
import type { RecipeSearchResultItem } from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import { menusApi } from "redux/services/menusApi";
import { recipesApi } from "redux/services/recipesApi";

import { useProfileFavourites } from "hooks/useProfileFavourites";

import { byOffset, mockedGet } from "test/apiClientMock";
import { TEST_AUTHOR, TEST_UNRATED } from "test/constants";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

const FAVOURITES_PARAMS = { favourites: true };

const BORSCHT: RecipeSearchResultItem = {
    id: 1,
    title: "Borscht",
    language: "en",
    type_name: "Soup",
    creation_date: "2024-01-01",
    cooking_time: 60,
    calories_per_portion: null,
    ingredients: [],
    isOwner: false,
    photo_key: null,
    ...TEST_UNRATED,
    author: TEST_AUTHOR,
    isFavourite: true,
    containsAvoided: false,
    tags: [],
};
const PELMENI: RecipeSearchResultItem = { ...BORSCHT, id: 2, title: "Pelmeni" };
const WEEKDAY: Menu = {
    id: 1,
    title: "Weekday menu",
    categoryName: "Lunch",
    menuContent: "",
    recipe_count: 3,
};

const mockFavourites = () => {
    mockedGet.mockImplementation((url: string, config: unknown) => {
        if (url === API_ROUTES.recipes.byFilters) {
            return Promise.resolve({
                data:
                    byOffset(config) === 0
                        ? { items: [BORSCHT], total: 2 }
                        : { items: [PELMENI], total: 2 },
            });
        }
        if (url === API_ROUTES.menu.list) {
            return Promise.resolve({ data: { items: [WEEKDAY], total: 1 } });
        }

        return Promise.reject(new Error(`unexpected GET ${url}`));
    });
};

const setup = async () => {
    mockFavourites();

    const store = makeTestStore();

    await Promise.all([
        store.dispatch(
            recipesApi.endpoints.getRecipesByFilters.initiate(
                FAVOURITES_PARAMS,
            ),
        ),
        store.dispatch(menusApi.endpoints.getMenus.initiate(FAVOURITES_PARAMS)),
    ]);

    return renderHookWithStore(() => useProfileFavourites(), store);
};

describe("useProfileFavourites", () => {
    it("should ask both lists for favourites only", async () => {
        mockFavourites();
        renderHookWithStore(() => useProfileFavourites());

        await act(async () => {
            await Promise.resolve();
        });

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.recipes.byFilters, {
            params: { favourites: true, limit: PAGE_SIZE, offset: 0 },
        });
        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.menu.list, {
            params: { favourites: true, limit: PAGE_SIZE, offset: 0 },
        });
    });

    it("should count every favourite across both lists, not just the loaded pages", async () => {
        const { result } = await setup();

        expect(result.current.count).toBe(3);
        expect(result.current.recipes.items).toEqual([BORSCHT]);
        expect(result.current.recipes.total).toBe(2);
        expect(result.current.menus.items).toEqual([WEEKDAY]);
    });

    it("should load the next page of favourite recipes", async () => {
        const { result } = await setup();

        expect(result.current.recipes.hasNextPage).toBe(true);
        expect(result.current.menus.hasNextPage).toBe(false);

        act(() => {
            result.current.recipes.fetchNextPage();
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.recipes.items).toEqual([BORSCHT, PELMENI]);
        expect(result.current.recipes.hasNextPage).toBe(false);
    });
});
