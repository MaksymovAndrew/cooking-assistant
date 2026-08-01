import { ValidationError } from "domain/errors/AppError";

import UpdateCalorieGoal from "application/use-cases/calories/UpdateCalorieGoal";

import { catchError } from "test/helpers/assertions";

function setup() {
    const calorieRepository = { updateGoal: jest.fn() };
    const useCase = new UpdateCalorieGoal(calorieRepository);

    return { useCase, calorieRepository };
}

describe("UpdateCalorieGoal", () => {
    it("should reject an invalid calorie_goal_period", async () => {
        const { useCase } = setup();

        const error = await catchError(
            useCase.execute(7, {
                calorie_goal: 2000,
                calorie_goal_period: "year",
                meal_calorie_limit: null,
            }),
        );

        expect(error).toBeInstanceOf(ValidationError);
    });

    it("should update the goal with the validated values", async () => {
        const { useCase, calorieRepository } = setup();

        await useCase.execute(7, {
            calorie_goal: 2000,
            calorie_goal_period: "day",
            meal_calorie_limit: 800,
        });

        expect(calorieRepository.updateGoal).toHaveBeenCalledWith(7, {
            calorie_goal: 2000,
            calorie_goal_period: "day",
            meal_calorie_limit: 800,
        });
    });

    it("should allow clearing the goal back to null", async () => {
        const { useCase, calorieRepository } = setup();

        await useCase.execute(7, {
            calorie_goal: null,
            calorie_goal_period: null,
            meal_calorie_limit: null,
        });

        expect(calorieRepository.updateGoal).toHaveBeenCalledWith(7, {
            calorie_goal: null,
            calorie_goal_period: null,
            meal_calorie_limit: null,
        });
    });
});
