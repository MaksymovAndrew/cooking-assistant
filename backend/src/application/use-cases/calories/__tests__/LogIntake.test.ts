import { ERROR_MESSAGES } from "constants/errorMessages";
import { NotFoundError, ValidationError } from "domain/errors/AppError";

import LogIntake from "application/use-cases/calories/LogIntake";

import { catchError } from "test/helpers/assertions";

function setup() {
    const calorieRepository = {
        logIntake: jest.fn(),
        findRecipeCalories: jest.fn(),
        findMenuCalories: jest.fn(),
    };
    const useCase = new LogIntake(calorieRepository);

    return { useCase, calorieRepository };
}

describe("LogIntake", () => {
    it("should reject a payload with neither recipe_id nor menu_id", async () => {
        const { useCase } = setup();

        const error = await catchError(useCase.execute(7, { portions: 1 }));

        expect(error).toBeInstanceOf(ValidationError);
    });

    it("should reject a payload with both recipe_id and menu_id", async () => {
        const { useCase } = setup();

        const error = await catchError(
            useCase.execute(7, { recipe_id: 1, menu_id: 2, portions: 1 }),
        );

        expect(error).toBeInstanceOf(ValidationError);
    });

    it("should throw a 404 NotFoundError when the recipe does not exist", async () => {
        const { useCase, calorieRepository } = setup();

        calorieRepository.findRecipeCalories.mockResolvedValue(null);

        const error = await catchError(
            useCase.execute(7, { recipe_id: 5, portions: 1 }),
        );

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_MESSAGES.RECIPE_NOT_FOUND,
            404,
        );
    });

    it("should throw a 404 NotFoundError when the menu does not exist", async () => {
        const { useCase, calorieRepository } = setup();

        calorieRepository.findMenuCalories.mockResolvedValue(null);

        const error = await catchError(
            useCase.execute(7, { menu_id: 9, portions: 1 }),
        );

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_MESSAGES.MENU_NOT_FOUND,
            404,
        );
    });

    it("should throw a ValidationError when the source has no calorie information", async () => {
        const { useCase, calorieRepository } = setup();

        calorieRepository.findRecipeCalories.mockResolvedValue({
            title: "Soup",
            calories: null,
        });

        const error = await catchError(
            useCase.execute(7, { recipe_id: 5, portions: 1 }),
        );

        expect(error).toBeAppError(
            ValidationError,
            ERROR_MESSAGES.CALORIES_NOT_AVAILABLE,
            400,
        );
    });

    it("should ignore any client-supplied calories and compute the total itself, rounding per portion before multiplying", async () => {
        const { useCase, calorieRepository } = setup();

        calorieRepository.findRecipeCalories.mockResolvedValue({
            title: "Soup",
            calories: 21.6,
        });
        calorieRepository.logIntake.mockResolvedValue({ id: 1 });

        await useCase.execute(7, {
            recipe_id: 5,
            portions: 2,
            calories: 999,
        });

        expect(calorieRepository.logIntake).toHaveBeenCalledWith(7, {
            recipe_id: 5,
            menu_id: undefined,
            title: "Soup",
            portions: 2,
            calories: 44,
        });
    });

    it("should log intake from a menu using its summed calories", async () => {
        const { useCase, calorieRepository } = setup();

        calorieRepository.findMenuCalories.mockResolvedValue({
            title: "Weekend menu",
            calories: 500,
        });
        calorieRepository.logIntake.mockResolvedValue({ id: 2 });

        await useCase.execute(7, { menu_id: 9, portions: 1 });

        expect(calorieRepository.logIntake).toHaveBeenCalledWith(7, {
            recipe_id: undefined,
            menu_id: 9,
            title: "Weekend menu",
            portions: 1,
            calories: 500,
        });
    });
});
