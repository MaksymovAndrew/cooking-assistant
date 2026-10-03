import type { RecipeFilterParams } from "types/recipe";
import type { UserIngredient } from "types/userIngredient";

import { API_ROUTES } from "api/endpoints";

import { userIngredientsApi } from "redux/services/userIngredientsApi";
import type { RootState } from "redux/store";

import { useRecipeListGate } from "hooks/useRecipeListGate";

import type { RecipeFilterState } from "utils/filters/recipeFilterDefs";

import { mockGetByUrl } from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

const NO_FILTERS: RecipeFilterState = {
    search: "",
    types: [],
    ingredients: [],
    cookingTime: { min: "", max: "" },
    calories: { min: "", max: "" },
    sort: null,
    inPantry: false,
    favourites: false,
    topRated: false,
    excludeAllergens: [],
    hideAvoided: false,
    tags: [],
    languages: [],
};
const VIEWER_FILTERS: RecipeFilterState = {
    ...NO_FILTERS,
    inPantry: true,
    favourites: true,
    hideAvoided: true,
    tags: [3],
};
const VIEWER_PARAMS: RecipeFilterParams = {
    recipe_name: "soup",
    in_pantry: true,
    favourites: true,
    hide_avoided: true,
    tag_ids: "3",
};

const CARROT: UserIngredient = {
    ingredient_id: 1,
    ingredient_slug: "carrot",
    ingredient_name: "Carrot",
    category: "vegetables",
    unit_name: "g",
    quantity_person_ingradient: 2,
    allergens: [],
    lots: [],
};

const renderGate = async (
    status: RootState["session"]["status"],
    filters: RecipeFilterState,
    params: RecipeFilterParams,
    pantry: UserIngredient[] | null = null,
) => {
    const store = makeTestStore({ session: { status } });

    if (pantry !== null) {
        mockGetByUrl({ [API_ROUTES.userIngredients.list]: pantry });
        await store.dispatch(
            userIngredientsApi.endpoints.getUserIngredients.initiate(null),
        );
    }

    return renderHookWithStore(() => useRecipeListGate(filters, params), store);
};

describe("useRecipeListGate", () => {
    it("should drop the filters a guest cannot use from the request", async () => {
        const { result } = await renderGate(
            "guest",
            VIEWER_FILTERS,
            VIEWER_PARAMS,
        );

        expect(result.current.queryParams).toEqual({
            recipe_name: "soup",
            in_pantry: undefined,
            favourites: undefined,
            hide_avoided: undefined,
            tag_ids: undefined,
        });
        expect(result.current.isHeldBack).toBe(false);
    });

    it("should hold a viewer-only request back until the session is known", async () => {
        const { result } = await renderGate(
            "checking",
            { ...NO_FILTERS, favourites: true },
            { favourites: true },
        );

        expect(result.current.isHeldBack).toBe(true);
    });

    it("should not hold a public request back while the session is checked", async () => {
        const { result } = await renderGate("checking", NO_FILTERS, {});

        expect(result.current.isHeldBack).toBe(false);
    });

    it("should hold the pantry filter back once the pantry turns out empty", async () => {
        const { result } = await renderGate(
            "authed",
            { ...NO_FILTERS, inPantry: true },
            { in_pantry: true },
            [],
        );

        expect(result.current.isPantryEmpty).toBe(true);
        expect(result.current.isHeldBack).toBe(true);
    });

    it("should send a signed-in viewer's filters as they are", async () => {
        const { result } = await renderGate(
            "authed",
            VIEWER_FILTERS,
            VIEWER_PARAMS,
            [CARROT],
        );

        expect(result.current.queryParams).toEqual(VIEWER_PARAMS);
        expect(result.current.isPantryEmpty).toBe(false);
        expect(result.current.isHeldBack).toBe(false);
    });
});
