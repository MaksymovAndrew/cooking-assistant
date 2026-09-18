import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";
import type { DietPreferencesRepository } from "domain/repositories/DietPreferencesRepository";

import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

export default class AddAvoidedIngredient {
    constructor(
        private dietPreferencesRepository: Pick<
            DietPreferencesRepository,
            "addIngredient"
        >,
    ) {}

    async execute(
        personId: string | number,
        ingredientId: string | number,
    ): Promise<void> {
        const validPersonId = validate(idSchema, personId);
        const validIngredientId = validate(idSchema, ingredientId);

        const outcome = await this.dietPreferencesRepository.addIngredient(
            validPersonId,
            validIngredientId,
        );

        if (outcome === "person_not_found") {
            throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND);
        }

        if (outcome === "ingredient_not_found") {
            throw new NotFoundError(ERROR_CODES.INGREDIENT_NOT_FOUND);
        }
    }
}
