import type { CookSummary } from "types/pantryConsumption";

import { API_ROUTES } from "api/endpoints";

import { selectServerDataVersion } from "redux/selectors/serverDataSelectors";
import { pantryConsumptionApi } from "redux/services/pantryConsumptionApi";
import { runNotificationAction } from "redux/slices/notificationsSlice";

import { mockedPost } from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const CARROT = {
    ingredient_id: 3,
    slug: "carrot",
    name: "Carrot",
    unit_name: "g",
    needed: 200,
    quantity: 200,
};

const cook = (summary: CookSummary) => {
    mockedPost.mockResolvedValue({ data: summary });
    const store = makeTestStore();

    return store
        .dispatch(
            pantryConsumptionApi.endpoints.cookRecord.initiate({
                recipe_id: 5,
                portions: 1,
                log_calories: false,
            }),
        )
        .then(() => store);
};

describe("cooking toasts", () => {
    it("should confirm a cooking with how much was used and offer to undo it", async () => {
        const store = await cook({
            consumptionId: 42,
            deducted: [CARROT, { ...CARROT, ingredient_id: 4 }],
            skipped: [],
            calorieIntake: null,
        });

        expect(store.getState().notifications.items).toEqual([
            expect.objectContaining({
                type: "success",
                message: "Cooked! 2 products taken from your pantry",
                action: {
                    kind: "undoCooking",
                    consumptionId: 42,
                    label: "Undo",
                },
            }),
        ]);
    });

    it("should say so when nothing was in the pantry", async () => {
        const store = await cook({
            consumptionId: 42,
            deducted: [],
            skipped: [{ ingredient_id: 3, slug: "carrot", name: "Carrot" }],
            calorieIntake: null,
        });

        expect(store.getState().notifications.items[0].message).toBe(
            "Cooked! None of it was in your pantry",
        );
    });

    it("should mark the server-rendered data stale after cooking and after undoing", async () => {
        const store = await cook({
            consumptionId: 42,
            deducted: [CARROT],
            skipped: [],
            calorieIntake: null,
        });

        expect(selectServerDataVersion(store.getState())).toBe(1);

        mockedPost.mockResolvedValue({ data: null });
        await store.dispatch(
            pantryConsumptionApi.endpoints.undoCooking.initiate(42),
        );

        expect(selectServerDataVersion(store.getState())).toBe(2);
        const { items } = store.getState().notifications;

        expect(items[items.length - 1].message).toBe(
            "Undone - everything is back in your pantry",
        );
    });

    it("should undo the cooking when the toast's action is run", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const store = makeTestStore();

        store.dispatch(
            runNotificationAction({
                kind: "undoCooking",
                consumptionId: 42,
                label: "Undo",
            }),
        );

        await Promise.resolve();

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.undoCook(42),
            undefined,
        );
    });
});
