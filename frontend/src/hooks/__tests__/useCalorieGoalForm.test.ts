import { act } from "@testing-library/react";

import type { CurrentUser } from "types/auth";

import { API_ROUTES } from "api/endpoints";

import { useCalorieGoalForm } from "hooks/useCalorieGoalForm";

import { mockedPut } from "test/apiClientMock";
import { renderHookWithStore } from "test/store";

jest.mock("api/client");

const CURRENT_USER: CurrentUser = {
    id: 1,
    name: "Claude",
    surname: "Cook",
    login: "claude",
    created_at: "2025-06-15T00:00:00.000Z",
    email: "claude@example.com",
    email_verified_at: null,
    avatar: null,
    calorie_goal: 2000,
    meal_calorie_limit: 800,
};

const renderCalorieGoalForm = (
    currentUser: CurrentUser | undefined,
    onSuccess: () => void,
) => renderHookWithStore(() => useCalorieGoalForm(currentUser, onSuccess));

describe("useCalorieGoalForm", () => {
    it("should prefill the goal and meal limit from the current user", () => {
        const { result } = renderCalorieGoalForm(CURRENT_USER, jest.fn());

        expect(result.current.goal).toBe("2000");
        expect(result.current.mealLimit).toBe("800");
    });

    it("should default to an empty goal and meal limit when there is no current user", () => {
        const { result } = renderCalorieGoalForm(undefined, jest.fn());

        expect(result.current.goal).toBe("");
        expect(result.current.mealLimit).toBe("");
    });

    it("should submit the parsed goal and meal limit", async () => {
        mockedPut.mockResolvedValue({ data: null });
        const onSuccess = jest.fn();

        const { result } = renderCalorieGoalForm(CURRENT_USER, onSuccess);

        act(() => {
            result.current.setGoal("2200");
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPut).toHaveBeenCalledWith(API_ROUTES.calories.goal, {
            calorie_goal: 2200,
            meal_calorie_limit: 800,
        });
        expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it("should submit null for a cleared goal or meal limit", async () => {
        mockedPut.mockResolvedValue({ data: null });

        const { result } = renderCalorieGoalForm(CURRENT_USER, jest.fn());

        act(() => {
            result.current.setGoal("");
        });
        act(() => {
            result.current.setMealLimit("");
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPut).toHaveBeenCalledWith(API_ROUTES.calories.goal, {
            calorie_goal: null,
            meal_calorie_limit: null,
        });
    });

    it("should set an error for a non-positive goal without submitting", async () => {
        const { result } = renderCalorieGoalForm(CURRENT_USER, jest.fn());

        act(() => {
            result.current.setGoal("0");
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPut).not.toHaveBeenCalled();
        expect(result.current.error).toBe("Enter a valid calorie goal");
    });

    it("should set an error for an invalid meal limit without submitting", async () => {
        const { result } = renderCalorieGoalForm(CURRENT_USER, jest.fn());

        act(() => {
            result.current.setMealLimit("not-a-number");
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPut).not.toHaveBeenCalled();
        expect(result.current.error).toBe("Enter a valid per-meal limit");
    });

    it("should set a generic error when the request fails", async () => {
        mockedPut.mockRejectedValue({
            isAxiosError: true,
            response: { status: 500, data: { error: "Boom" } },
            message: "Request failed",
        });
        const onSuccess = jest.fn();

        const { result } = renderCalorieGoalForm(CURRENT_USER, onSuccess);

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(result.current.error).toBe(
            "Something went wrong. Please try again.",
        );
        expect(onSuccess).not.toHaveBeenCalled();
    });
});
