import type { CookSummary } from "types/pantryConsumption";

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
