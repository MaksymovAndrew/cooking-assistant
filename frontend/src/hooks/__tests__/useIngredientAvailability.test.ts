import type { RecipeDetailIngredient } from "types/recipe";
import type { UserIngredient } from "types/userIngredient";

import { userIngredientsApi } from "redux/services/userIngredientsApi";

import { useIngredientAvailability } from "hooks/useIngredientAvailability";

import { mockedGet } from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

const TOMATO: RecipeDetailIngredient = {
    id: 1,
    slug: "tomato",
    name: "Tomato",
    category: "vegetables",
    quantity_recipe_ingredients: 2,
    unit_name: "piece",
    allergens: [],
    calories_per_unit: null,
};
const ONION: RecipeDetailIngredient = {
    id: 2,
    slug: "onion",
    name: "Onion",
    category: "vegetables",
    quantity_recipe_ingredients: 1,
    unit_name: "piece",
    allergens: [],
    calories_per_unit: null,
};

const PANTRY_TOMATO: UserIngredient = {
    ingredient_id: 1,
    ingredient_slug: "tomato",
    ingredient_name: "Tomato",
    category: "vegetables",
    unit_name: "piece",
    quantity_person_ingradient: 3,
    allergens: [],
};

// pre-seed the cache by awaiting the real query thunk before the hook mounts, so the hook reads already-fulfilled data on first render
const setup = async (ingredients: RecipeDetailIngredient[]) => {
    const store = makeTestStore({ session: { status: "authed" } });

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

    it("should skip the pantry request and report nothing as available while the session is still checking", () => {
        const store = makeTestStore();

        const { result } = renderHookWithStore(
            () => useIngredientAvailability([TOMATO, ONION]),
            store,
        );

        expect(mockedGet).not.toHaveBeenCalled();
        expect(result.current.haveCount).toBe(0);
        expect(result.current.missingCount).toBe(2);
    });
});
