import { act } from "@testing-library/react";

import type { CookRequirement } from "types/pantryConsumption";
import type { UserIngredient } from "types/userIngredient";

import { API_ROUTES } from "api/endpoints";

import { selectActiveModal } from "redux/selectors/uiSelectors";
import { userIngredientsApi } from "redux/services/userIngredientsApi";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { useCookedIt } from "hooks/useCookedIt";

import { makeAxiosError, mockedPost, mockGetByUrl } from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

const MODAL_ID = "cooked-it";

const FLOUR: CookRequirement = {
    ingredient_id: 10,
    slug: "flour",
    name: "Flour",
    unit_name: "g",
    quantity: 200,
};
const PANTRY_FLOUR: UserIngredient = {
    ingredient_id: 10,
    ingredient_slug: "flour",
    ingredient_name: "Flour",
    category: "flour_baking",
    unit_name: "g",
    quantity_person_ingradient: 300,
    allergens: ["gluten"],
    lots: [{ id: 1, quantity: 300, purchase_date: "2026-06-01" }],
};

const setup = async (initialPortions?: number) => {
    mockGetByUrl({ [API_ROUTES.userIngredients.list]: [PANTRY_FLOUR] });

    const store = makeTestStore({
        ui: {
            queue: [
                {
                    id: MODAL_ID,
                    type: MODAL_TYPE.cookedIt,
                    recipeId: 5,
                    title: "Pancakes",
                    requirements: [FLOUR],
                    caloriesPerPortion: null,
                },
            ],
        },
    });

    await store.dispatch(
        userIngredientsApi.endpoints.getUserIngredients.initiate(null),
    );

    return renderHookWithStore(
        () =>
            useCookedIt({
                modalId: MODAL_ID,
                recipeId: 5,
                requirements: [FLOUR],
                initialPortions,
            }),
        store,
    );
};

describe("useCookedIt", () => {
    it("should start from one portion when the page sets none", async () => {
        const { result } = await setup();

        expect(result.current.portions).toBe(1);
        expect(result.current.logCalories).toBe(false);
    });

    it("should preview the pantry against the chosen portions", async () => {
        const { result } = await setup(1);

        expect(result.current.preview[0]).toEqual(
            expect.objectContaining({ needed: 200, status: "full" }),
        );

        act(() => {
            result.current.setPortions(2);
        });

        expect(result.current.preview[0]).toEqual(
            expect.objectContaining({ needed: 400, status: "partial" }),
        );
    });

    it("should stay open and allow another try when cooking fails", async () => {
        mockedPost.mockRejectedValueOnce(makeAxiosError(500, "Server error"));
        const { result, store } = await setup(2);

        await act(async () => {
            await result.current.confirm();
        });

        expect(selectActiveModal(store.getState())).toEqual(
            expect.objectContaining({ id: MODAL_ID }),
        );

        mockedPost.mockResolvedValueOnce({
            data: {
                consumptionId: 3,
                deducted: [],
                skipped: [],
                calorieIntake: null,
            },
        });

        await act(async () => {
            await result.current.confirm();
        });

        expect(mockedPost).toHaveBeenCalledTimes(2);
        expect(mockedPost).toHaveBeenLastCalledWith(
            API_ROUTES.userIngredients.cook,
            {
                recipe_id: 5,
                menu_id: undefined,
                portions: 2,
                log_calories: false,
            },
        );
        expect(selectActiveModal(store.getState())).toBeNull();
    });
});
