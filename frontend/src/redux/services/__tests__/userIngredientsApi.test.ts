import { PAGE_SIZE } from "constants/pagination";
import type {
    SaveUserIngredientsRequest,
    UpdatePurchaseRequest,
} from "types/userIngredient";

import { API_ROUTES } from "api/endpoints";

import { menusApi } from "redux/services/menusApi";
import { recipesApi } from "redux/services/recipesApi";
import { userIngredientsApi } from "redux/services/userIngredientsApi";

import {
    mockedDelete,
    mockedGet,
    mockedPost,
    mockedPut,
    mockGetByUrl,
} from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

type TestStore = ReturnType<typeof makeTestStore>;

const SAVE: SaveUserIngredientsRequest = {
    ingredients: [
        { id: 1, ingredient_name: "Salt", quantity_person_ingradient: 1 },
    ],
};
const PURCHASE: UpdatePurchaseRequest = { quantity: 4 };

const MENU_ID = 9;
const IN_PANTRY = { in_pantry: true };

describe("userIngredientsApi", () => {
    it.each([
        [
            "adding or restocking ingredients",
            (store: TestStore) =>
                store.dispatch(
                    userIngredientsApi.endpoints.saveUserIngredient.initiate(
                        SAVE,
                    ),
                ),
        ],
        [
            "removing an ingredient",
            (store: TestStore) =>
                store.dispatch(
                    userIngredientsApi.endpoints.deleteUserIngredient.initiate(
                        1,
                    ),
                ),
        ],
        [
            "editing a purchase",
            (store: TestStore) =>
                store.dispatch(
                    userIngredientsApi.endpoints.updatePurchase.initiate({
                        purchaseId: 9,
                        body: PURCHASE,
                    }),
                ),
        ],
        [
            "discarding expired purchases",
            (store: TestStore) =>
                store.dispatch(
                    userIngredientsApi.endpoints.discardPurchases.initiate([9]),
                ),
        ],
        [
            "deleting a purchase",
            (store: TestStore) =>
                store.dispatch(
                    userIngredientsApi.endpoints.deletePurchase.initiate(9),
                ),
        ],
    ])(
        "should refetch a cached menu and the in-pantry recipe list after %s, since both follow the pantry",
        async (_change, write) => {
            mockGetByUrl({
                [API_ROUTES.menu.byId(MENU_ID)]: null,
                [API_ROUTES.recipes.byFilters]: { items: [], total: 0 },
            });
            mockedPut.mockResolvedValue({ data: null });
            mockedPost.mockResolvedValue({ data: { discarded: 1 } });
            mockedDelete.mockResolvedValue({ data: null });
            const store = makeTestStore();
            const menu = store.dispatch(
                menusApi.endpoints.getMenuById.initiate(MENU_ID),
            );
            const recipes = store.dispatch(
                recipesApi.endpoints.getRecipesByFilters.initiate(IN_PANTRY),
            );

            await Promise.all([menu, recipes]);
            mockedGet.mockClear();

            await write(store);
            await Promise.all([
                store.dispatch(
                    menusApi.endpoints.getMenuById.initiate(MENU_ID),
                ),
                store.dispatch(
                    recipesApi.endpoints.getRecipesByFilters.initiate(
                        IN_PANTRY,
                    ),
                ),
            ]);

            expect(mockedGet).toHaveBeenCalledWith(
                API_ROUTES.menu.byId(MENU_ID),
                { params: undefined },
            );
            expect(mockedGet).toHaveBeenCalledWith(
                API_ROUTES.recipes.byFilters,
                { params: { ...IN_PANTRY, limit: PAGE_SIZE, offset: 0 } },
            );
            menu.unsubscribe();
            recipes.unsubscribe();
        },
    );
});
