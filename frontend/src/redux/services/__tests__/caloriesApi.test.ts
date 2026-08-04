import type {
    CalorieIntakeItem,
    UpdateCalorieGoalRequest,
} from "types/calorie";

import { API_ROUTES } from "api/endpoints";

import { caloriesApi } from "redux/services/caloriesApi";
import { recipesApi } from "redux/services/recipesApi";

import {
    mockedDelete,
    mockedGet,
    mockedPost,
    mockedPut,
} from "test/apiClientMock";
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
    it("should fetch the intake log for a date range", async () => {
        mockedGet.mockResolvedValue({ data: [ENTRY] });
        const store = makeTestStore();

        const result = await store.dispatch(
            caloriesApi.endpoints.getCalorieIntake.initiate(RANGE),
        );

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.calories.intake, {
            params: RANGE,
        });
        expect(result.data).toEqual([ENTRY]);
    });

    it("should log intake for a recipe", async () => {
        mockedPost.mockResolvedValue({ data: ENTRY });
        const store = makeTestStore();

        await store.dispatch(
            caloriesApi.endpoints.logCalorieIntake.initiate({
                recipe_id: 5,
                portions: 2,
            }),
        );

        expect(mockedPost).toHaveBeenCalledWith(API_ROUTES.calories.intake, {
            recipe_id: 5,
            portions: 2,
        });
    });

    it("should delete an intake entry", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            caloriesApi.endpoints.deleteCalorieIntake.initiate(1),
        );

        expect(mockedDelete).toHaveBeenCalledWith(
            API_ROUTES.calories.intakeById(1),
            { params: undefined },
        );
    });

    it("should update the calorie goal", async () => {
        mockedPut.mockResolvedValue({ data: null });
        const store = makeTestStore();
        const goal: UpdateCalorieGoalRequest = {
            calorie_goal: 2000,
        };

        await store.dispatch(
            caloriesApi.endpoints.updateCalorieGoal.initiate(goal),
        );

        expect(mockedPut).toHaveBeenCalledWith(API_ROUTES.calories.goal, goal);
    });

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
});
