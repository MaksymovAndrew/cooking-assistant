import type { RecipeDetailIngredient } from "types/recipe";
import type { UserIngredient } from "types/userIngredient";

import { userIngredientsApi } from "redux/services/userIngredientsApi";

import { useIngredientAvailability } from "hooks/useIngredientAvailability";

import { mockedGet } from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

const TOMATO: RecipeDetailIngredient = {
    id: 1,
    name: "Tomato",
    quantity_recipe_ingredients: 2,
    unit_name: "pcs",
};
const ONION: RecipeDetailIngredient = {
    id: 2,
    name: "Onion",
    quantity_recipe_ingredients: 1,
    unit_name: "pcs",
};

const PANTRY_TOMATO: UserIngredient = {
    ingredient_id: 1,
    ingredient_name: "Tomato",
    unit_name: "pcs",
    quantity_person_ingradient: 3,
};

// pre-seed the cache by awaiting the real query thunk before the hook mounts,
// so the hook reads already-fulfilled data on first render
const setup = async (ingredients: RecipeDetailIngredient[]) => {
    const store = makeTestStore();

    await store.dispatch(
        userIngredientsApi.endpoints.getUserIngredients.initiate(null),
    );

    return renderHookWithStore(
        () => useIngredientAvailability(ingredients),
        store,
    );
};

describe("useIngredientAvailability", () => {
    it("should mark ingredients present in the pantry as have and the rest as missing", async () => {
        mockedGet.mockResolvedValue({ data: [PANTRY_TOMATO] });

        const { result } = await setup([TOMATO, ONION]);

        expect(result.current.availability).toEqual([
            { ...TOMATO, have: true },
            { ...ONION, have: false },
        ]);
        expect(result.current.haveCount).toBe(1);
        expect(result.current.missingCount).toBe(1);
    });
});
