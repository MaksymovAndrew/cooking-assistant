import type { CalorieIntakeItem } from "types/calorie";

import { API_ROUTES } from "api/endpoints";

import { authApi } from "redux/services/authApi";
import { caloriesApi } from "redux/services/caloriesApi";
import { recipesApi } from "redux/services/recipesApi";

import { mockedGet, mockedPost, mockedPut } from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const RANGE = {
    from: "2026-01-01T00:00:00.000Z",
    to: "2026-01-31T23:59:59.999Z",
};
const ENTRY: CalorieIntakeItem = {
    id: 1,
    person_id: 7,
    recipe_id: 5,
    menu_id: null,
    title: "Soup",
    portions: 2,
    calories: 44,
    eaten_at: "2026-01-01T00:00:00.000Z",
};

describe("caloriesApi", () => {
    it("should refetch the intake log after logging a new entry", async () => {
        mockedGet.mockResolvedValue({ data: [] });
        mockedPost.mockResolvedValue({ data: ENTRY });
        const store = makeTestStore();

        await store.dispatch(
            caloriesApi.endpoints.getCalorieIntake.initiate(RANGE),
        );
        const callsAfterFirstFetch = mockedGet.mock.calls.length;

        await store.dispatch(
            caloriesApi.endpoints.logCalorieIntake.initiate({
                recipe_id: 5,
                portions: 1,
            }),
        );
        await store.dispatch(
            caloriesApi.endpoints.getCalorieIntake.initiate(RANGE),
        );

        expect(mockedGet.mock.calls.length).toBeGreaterThan(
            callsAfterFirstFetch,
        );
    });

    it("should refetch the intake log after a recipe update changes its calories", async () => {
        mockedGet.mockResolvedValue({ data: [] });
        mockedPut.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            caloriesApi.endpoints.getCalorieIntake.initiate(RANGE),
        );
        const callsAfterFirstFetch = mockedGet.mock.calls.length;

        await store.dispatch(
            recipesApi.endpoints.updateRecipe.initiate({
                id: "5",
                data: {
                    title: "Soup",
                    language: "en",
                    content: "boil",
                    type_id: 1,
                    cooking_time: 30,
                    calories_override: null,
                    ingredients: [{ id: 1, quantity_recipe_ingredients: 2 }],
                },
            }),
        );
        await store.dispatch(
            caloriesApi.endpoints.getCalorieIntake.initiate(RANGE),
        );

        expect(mockedGet.mock.calls.length).toBeGreaterThan(
            callsAfterFirstFetch,
        );
    });

    it("should refetch the current user after the goal changes, since it carries the goal", async () => {
        mockedGet.mockResolvedValue({ data: null });
        mockedPut.mockResolvedValue({ data: null });
        const store = makeTestStore();
        const me = store.dispatch(authApi.endpoints.getMe.initiate(null));

        await me;
        mockedGet.mockClear();

        await store.dispatch(
            caloriesApi.endpoints.updateCalorieGoal.initiate({
                calorie_goal: 2000,
            }),
        );
        await store.dispatch(authApi.endpoints.getMe.initiate(null));

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.auth.me, {
            params: undefined,
        });
        me.unsubscribe();
    });
});
