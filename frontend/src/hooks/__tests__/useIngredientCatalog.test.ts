import { act } from "@testing-library/react";

import type { Ingredient } from "types/ingredient";
import type { UserIngredient } from "types/userIngredient";

import { API_ROUTES } from "api/endpoints";

import { ingredientsApi } from "redux/services/ingredientsApi";
import { userIngredientsApi } from "redux/services/userIngredientsApi";

import { useIngredientCatalog } from "hooks/useIngredientCatalog";

import { mockedGet, mockGetByUrl } from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

const CATALOG: Ingredient[] = [
    {
        id: 2,
        slug: "onion",
        name: "Onion",
        category: "vegetables",
        unit_name: "g",
        allergens: [],
        days_to_expire: 30,
        calories_per_unit: null,
    },
    {
        id: 1,
        slug: "carrot",
        name: "Carrot",
        category: "vegetables",
        unit_name: "g",
        allergens: [],
        days_to_expire: 14,
        calories_per_unit: null,
    },
];
const OWNED: UserIngredient = {
    ingredient_id: 1,
    ingredient_slug: "carrot",
    ingredient_name: "Carrot",
    category: "vegetables",
    unit_name: "g",
    quantity_person_ingradient: 2,
    allergens: [],
    lots: [],
};

const setup = async (pantry: UserIngredient[] = [OWNED]) => {
    mockGetByUrl({
        [API_ROUTES.ingredients.list]: CATALOG,
        [API_ROUTES.userIngredients.list]: pantry,
    });

    const store = makeTestStore();

    await Promise.all([
        store.dispatch(ingredientsApi.endpoints.getIngredients.initiate(null)),
        store.dispatch(
            userIngredientsApi.endpoints.getUserIngredients.initiate(null),
        ),
    ]);

    return renderHookWithStore(() => useIngredientCatalog(), store);
};

describe("useIngredientCatalog", () => {
    it("should sort the catalog by name and map the pantry's ingredient_id to id", async () => {
        const { result } = await setup();

        expect(result.current.allIngredients.map((i) => i.name)).toEqual([
            "Carrot",
            "Onion",
        ]);
        expect(result.current.personIngredients[0].id).toBe(1);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isError).toBe(false);
    });

    it("should report a failed pantry request and refetch it on retry", async () => {
        mockedGet.mockRejectedValue(new Error("offline"));

        const store = makeTestStore();
        const { result } = renderHookWithStore(
            () => useIngredientCatalog(),
            store,
        );

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.isError).toBe(true);

        mockGetByUrl({
            [API_ROUTES.ingredients.list]: CATALOG,
            [API_ROUTES.userIngredients.list]: [OWNED],
        });

        // the store tells its subscribers about a fulfilled query on the next animation frame
        await act(async () => {
            result.current.retry();
            await new Promise((resolve) => requestAnimationFrame(resolve));
        });

        expect(result.current.isError).toBe(false);
        expect(result.current.personIngredients).toHaveLength(1);
    });
});
