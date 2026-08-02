import type {
    CalorieIntakeItem,
    IntakeRangeParams,
    LogIntakeRequest,
    UpdateCalorieGoalRequest,
} from "types/calorie";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";

const CALORIES = "Calories" as const;

export const caloriesApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getCalorieIntake: build.query<CalorieIntakeItem[], IntakeRangeParams>({
            query: (params) => ({ url: API_ROUTES.calories.intake, params }),
            providesTags: [CALORIES],
        }),
        logCalorieIntake: build.mutation<CalorieIntakeItem, LogIntakeRequest>({
            query: (data) => ({
                url: API_ROUTES.calories.intake,
                method: "POST",
                data,
            }),
            invalidatesTags: [CALORIES],
        }),
        deleteCalorieIntake: build.mutation<null, number>({
            query: (id) => ({
                url: API_ROUTES.calories.intakeById(id),
                method: "DELETE",
            }),
            invalidatesTags: [CALORIES],
        }),
        updateCalorieGoal: build.mutation<null, UpdateCalorieGoalRequest>({
            query: (data) => ({
                url: API_ROUTES.calories.goal,
                method: "PUT",
                data,
            }),
            invalidatesTags: [CALORIES, "Me"],
        }),
    }),
});

export const {
    useGetCalorieIntakeQuery,
    useLogCalorieIntakeMutation,
    useDeleteCalorieIntakeMutation,
    useUpdateCalorieGoalMutation,
} = caloriesApi;
