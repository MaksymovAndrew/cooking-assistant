import type { CookSummary } from "types/pantryConsumption";

import { API_ROUTES } from "api/endpoints";

import { pantryConsumptionApi } from "redux/services/pantryConsumptionApi";
import { userIngredientsApi } from "redux/services/userIngredientsApi";

import { mockedGet, mockedPost } from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const SUMMARY: CookSummary = {
    consumptionId: 42,
    deducted: [],
    skipped: [],
    calorieIntake: null,
};

describe("pantryConsumptionApi", () => {
    it("should post the cooking with its source, portions and calorie choice", async () => {
        mockedPost.mockResolvedValue({ data: SUMMARY });
        const store = makeTestStore();

        const result = await store.dispatch(
            pantryConsumptionApi.endpoints.cookRecord.initiate({
                menu_id: 9,
                portions: 2,
                log_calories: true,
            }),
        );

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.cook,
            { menu_id: 9, portions: 2, log_calories: true },
        );
        expect(result.data).toEqual(SUMMARY);
    });

    it("should post the undo to the cooking's own address", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            pantryConsumptionApi.endpoints.undoCooking.initiate(42),
        );

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.undoCook(42),
            undefined,
        );
    });

    it("should refetch the pantry after cooking and after undoing it", async () => {
        mockedGet.mockResolvedValue({ data: [] });
        mockedPost.mockResolvedValue({ data: SUMMARY });
        const store = makeTestStore();
        const fetchPantry = () =>
            store.dispatch(
                userIngredientsApi.endpoints.getUserIngredients.initiate(null),
            );

        await fetchPantry();
        const afterFirstFetch = mockedGet.mock.calls.length;

        await store.dispatch(
            pantryConsumptionApi.endpoints.cookRecord.initiate({
                recipe_id: 5,
                portions: 1,
                log_calories: false,
            }),
        );
        await fetchPantry();
        const afterCooking = mockedGet.mock.calls.length;

        await store.dispatch(
            pantryConsumptionApi.endpoints.undoCooking.initiate(42),
        );
        await fetchPantry();

        expect(afterCooking).toBeGreaterThan(afterFirstFetch);
        expect(mockedGet.mock.calls.length).toBeGreaterThan(afterCooking);
    });
});
