import type { CookRequirement } from "types/pantryConsumption";

import { selectActiveModal } from "redux/selectors/uiSelectors";

import { useCookedItHandler } from "hooks/useCookedItHandler";

import { renderHookWithStore } from "test/store";

const FLOUR: CookRequirement = {
    ingredient_id: 10,
    slug: "flour",
    name: "Flour",
    unit_name: "g",
    quantity: 200,
};

describe("useCookedItHandler", () => {
    it("should open the cooked-it modal with everything it needs", () => {
        const { result, store } = renderHookWithStore(() =>
            useCookedItHandler({
                recipeId: 5,
                title: "Pancakes",
                requirements: [FLOUR],
                caloriesPerPortion: 310,
                initialPortions: 2,
                isSignedIn: true,
            }),
        );

        result.current?.();

        expect(selectActiveModal(store.getState())).toEqual(
            expect.objectContaining({
                type: "cookedIt",
                recipeId: 5,
                title: "Pancakes",
                requirements: [FLOUR],
                caloriesPerPortion: 310,
                initialPortions: 2,
            }),
        );
    });

    it("should offer no button to a guest", () => {
        const { result } = renderHookWithStore(() =>
            useCookedItHandler({
                recipeId: 5,
                title: "Pancakes",
                requirements: [FLOUR],
                caloriesPerPortion: null,
                isSignedIn: false,
            }),
        );

        expect(result.current).toBeUndefined();
    });

    it("should offer no button for a record with no ingredients", () => {
        const { result } = renderHookWithStore(() =>
            useCookedItHandler({
                menuId: 9,
                title: "Empty menu",
                requirements: [],
                caloriesPerPortion: null,
                isSignedIn: true,
            }),
        );

        expect(result.current).toBeUndefined();
    });
});
