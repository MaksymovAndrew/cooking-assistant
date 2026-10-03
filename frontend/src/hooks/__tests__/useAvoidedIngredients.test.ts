import { API_ROUTES } from "api/endpoints";

import { dietPreferencesApi } from "redux/services/dietPreferencesApi";

import { useAvoidedIngredients } from "hooks/useAvoidedIngredients";

import { mockedGet, mockGetByUrl } from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

const BREAD = { id: 1, allergens: ["gluten"] };
const OLIVES = { id: 2, allergens: [] };
const LEEK = { id: 3, allergens: [] };

const setup = async () => {
    mockGetByUrl({
        [API_ROUTES.dietPreferences.get]: {
            allergens: ["gluten"],
            ingredient_ids: [OLIVES.id],
        },
    });

    const store = makeTestStore({ session: { status: "authed" } });

    await store.dispatch(
        dietPreferencesApi.endpoints.getDietPreferences.initiate(null),
    );

    return renderHookWithStore(() => useAvoidedIngredients(), store);
};

describe("useAvoidedIngredients", () => {
    it("should mark an avoided allergen", async () => {
        const { result } = await setup();

        expect(result.current.isAllergenAvoided("gluten")).toBe(true);
        expect(result.current.isAllergenAvoided("milk")).toBe(false);
    });

    it("should mark an ingredient avoided on its own or through one of its allergens", async () => {
        const { result } = await setup();

        expect(result.current.isIngredientAvoided(OLIVES)).toBe(true);
        expect(result.current.isIngredientAvoided(BREAD)).toBe(true);
        expect(result.current.isIngredientAvoided(LEEK)).toBe(false);
    });

    it("should avoid nothing for a guest and not ask the server", () => {
        const { result } = renderHookWithStore(
            () => useAvoidedIngredients(),
            makeTestStore({ session: { status: "guest" } }),
        );

        expect(result.current.isIngredientAvoided(BREAD)).toBe(false);
        expect(mockedGet).not.toHaveBeenCalled();
    });
});
