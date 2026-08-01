import { ERROR_MESSAGES } from "constants/errorMessages";
import { NotFoundError, ValidationError } from "domain/errors/AppError";
import type {
    CalorieRepository,
    CalorieSourceInfo,
} from "domain/repositories/CalorieRepository";

import { logIntakeSchema } from "application/validation/calorie.schemas";
import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

export default class LogIntake {
    constructor(
        private calorieRepository: Pick<
            CalorieRepository,
            "logIntake" | "findRecipeCalories" | "findMenuCalories"
        >,
    ) {}

    async execute(personId: string | number, input: unknown): Promise<unknown> {
        const validPersonId = validate(idSchema, personId);
        const { recipe_id, menu_id, portions } = validate(
            logIntakeSchema,
            input,
        );

        let source: CalorieSourceInfo | null;
        let isRecipe: boolean;

        if (typeof recipe_id === "number") {
            source = await this.calorieRepository.findRecipeCalories(recipe_id);
            isRecipe = true;
        } else if (typeof menu_id === "number") {
            source = await this.calorieRepository.findMenuCalories(menu_id);
            isRecipe = false;
        } else {
            // unreachable - logIntakeSchema.refine requires exactly one of recipe_id/menu_id
            throw new ValidationError(ERROR_MESSAGES.RECIPE_NOT_FOUND);
        }

        if (!source) {
            throw new NotFoundError(
                isRecipe
                    ? ERROR_MESSAGES.RECIPE_NOT_FOUND
                    : ERROR_MESSAGES.MENU_NOT_FOUND,
            );
        }
        if (source.calories === null) {
            throw new ValidationError(ERROR_MESSAGES.CALORIES_NOT_AVAILABLE);
        }

        return this.calorieRepository.logIntake(validPersonId, {
            recipe_id,
            menu_id,
            title: source.title,
            // round the per-portion value first, then multiply - matches the frontend's scaleCaloriesForPortions
            portions,
            calories: Math.round(source.calories) * portions,
        });
    }
}
