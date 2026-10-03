import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError, ValidationError } from "domain/errors/AppError";
import type { CookRequirement } from "domain/repositories/PantryConsumptionRepository";

import CookRecord from "application/use-cases/pantry/CookRecord";

import { catchError } from "test/helpers/assertions";

const FLOUR: CookRequirement = {
    ingredient_id: 10,
    slug: "flour",
    name: "Flour",
    unit_name: "g",
    quantity: 200,
};
const EGGS: CookRequirement = {
    ingredient_id: 20,
    slug: "eggs",
    name: "Eggs",
    unit_name: "pcs",
    quantity: 1.5,
};

function setup() {
    const pantryConsumptionRepository = {
        findRequirements: jest.fn(),
        cook: jest.fn(),
        undo: jest.fn(),
    };
    const calorieRepository = {
        findRecipeCalories: jest.fn(),
        findMenuCalories: jest.fn(),
    };
    const useCase = new CookRecord(
        pantryConsumptionRepository,
        calorieRepository,
    );

    calorieRepository.findRecipeCalories.mockResolvedValue({
        title: "Pancakes",
        calories: 310.4,
    });
    pantryConsumptionRepository.findRequirements.mockResolvedValue([
        FLOUR,
        EGGS,
    ]);
    pantryConsumptionRepository.cook.mockResolvedValue({
        consumptionId: 42,
        taken: [{ ingredient_id: 10, quantity: 300 }],
        calorieIntake: null,
    });

    return { useCase, pantryConsumptionRepository, calorieRepository };
}

describe("CookRecord", () => {
    it("should multiply every ingredient by the portions and cook the recipe", async () => {
        const { useCase, pantryConsumptionRepository } = setup();

        await useCase.execute(7, { recipe_id: 5, portions: 2 });

        expect(
            pantryConsumptionRepository.findRequirements,
        ).toHaveBeenCalledWith({ recipeId: 5 });
        expect(pantryConsumptionRepository.cook).toHaveBeenCalledWith(7, {
            source: { recipeId: 5 },
            title: "Pancakes",
            portions: 2,
            needs: [
                { ingredient_id: 10, quantity: 400 },
                { ingredient_id: 20, quantity: 3 },
            ],
            calorieEntry: null,
        });
    });

    it("should split the result into what was taken and what the pantry did not have", async () => {
        const { useCase } = setup();

        const summary = await useCase.execute(7, { recipe_id: 5, portions: 2 });

        expect(summary).toEqual({
            consumptionId: 42,
            deducted: [
                {
                    ingredient_id: 10,
                    slug: "flour",
                    name: "Flour",
                    unit_name: "g",
                    needed: 400,
                    quantity: 300,
                },
            ],
            skipped: [{ ingredient_id: 20, slug: "eggs", name: "Eggs" }],
            calorieIntake: null,
        });
    });

    it("should cook a menu from its own source", async () => {
        const { useCase, pantryConsumptionRepository, calorieRepository } =
            setup();

        calorieRepository.findMenuCalories.mockResolvedValue({
            title: "Sunday lunch",
            calories: 900,
        });

        await useCase.execute(7, { menu_id: 9, portions: 1 });

        expect(
            pantryConsumptionRepository.findRequirements,
        ).toHaveBeenCalledWith({ menuId: 9 });
        expect(pantryConsumptionRepository.cook).toHaveBeenCalledWith(
            7,
            expect.objectContaining({
                source: { menuId: 9 },
                title: "Sunday lunch",
            }),
        );
    });

    it("should log the calories for the cooked portions when asked to", async () => {
        const { useCase, pantryConsumptionRepository } = setup();

        await useCase.execute(7, {
            recipe_id: 5,
            portions: 3,
            log_calories: true,
        });

        expect(pantryConsumptionRepository.cook).toHaveBeenCalledWith(
            7,
            expect.objectContaining({
                calorieEntry: {
                    recipe_id: 5,
                    title: "Pancakes",
                    portions: 3,
                    calories: 930,
                },
            }),
        );
    });

    it("should refuse to log calories the source does not have, before touching the pantry", async () => {
        const { useCase, pantryConsumptionRepository, calorieRepository } =
            setup();

        calorieRepository.findRecipeCalories.mockResolvedValue({
            title: "Pancakes",
            calories: null,
        });

        const error = await catchError(
            useCase.execute(7, {
                recipe_id: 5,
                portions: 1,
                log_calories: true,
            }),
        );

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.CALORIES_NOT_AVAILABLE,
            400,
        );
        expect(pantryConsumptionRepository.cook).not.toHaveBeenCalled();
    });

    it("should cook a source without calories when they are not being logged", async () => {
        const { useCase, pantryConsumptionRepository, calorieRepository } =
            setup();

        calorieRepository.findRecipeCalories.mockResolvedValue({
            title: "Pancakes",
            calories: null,
        });

        await useCase.execute(7, { recipe_id: 5, portions: 1 });

        expect(pantryConsumptionRepository.cook).toHaveBeenCalledWith(
            7,
            expect.objectContaining({ calorieEntry: null }),
        );
    });

    it("should throw a 404 NotFoundError when the recipe does not exist", async () => {
        const { useCase, calorieRepository } = setup();

        calorieRepository.findRecipeCalories.mockResolvedValue(null);

        const error = await catchError(
            useCase.execute(7, { recipe_id: 5, portions: 1 }),
        );

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.RECIPE_NOT_FOUND,
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
            ERROR_CODES.MENU_NOT_FOUND,
            404,
        );
    });

    it("should reject a payload with both a recipe and a menu", async () => {
        const { useCase } = setup();

        const error = await catchError(
            useCase.execute(7, { recipe_id: 5, menu_id: 9, portions: 1 }),
        );

        expect(error).toBeInstanceOf(ValidationError);
    });

    it("should reject a payload with neither a recipe nor a menu", async () => {
        const { useCase } = setup();

        const error = await catchError(useCase.execute(7, { portions: 1 }));

        expect(error).toBeInstanceOf(ValidationError);
    });

    it("should reject fractional, zero and oversized portions", async () => {
        const { useCase } = setup();

        for (const portions of [1.5, 0, 101]) {
            const error = await catchError(
                useCase.execute(7, { recipe_id: 5, portions }),
            );

            expect(error).toBeInstanceOf(ValidationError);
        }
    });

    it("should throw a 404 NotFoundError when the account no longer exists", async () => {
        const { useCase, pantryConsumptionRepository } = setup();

        pantryConsumptionRepository.cook.mockResolvedValue("person_not_found");

        const error = await catchError(
            useCase.execute(7, { recipe_id: 5, portions: 1 }),
        );

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.USER_NOT_FOUND,
            404,
        );
    });
});
