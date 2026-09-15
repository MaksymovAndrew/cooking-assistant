import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";
import type { PantryRepository } from "domain/repositories/PantryRepository";

import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

export default class DeleteUserIngredient {
    constructor(
        private pantryRepository: Pick<PantryRepository, "deleteIngredient">,
    ) {}

    async execute(
        userId: string | number,
        ingredientId: string | number,
    ): Promise<void> {
        const validUserId = validate(idSchema, userId);
        const validIngredientId = validate(idSchema, ingredientId);
        const deleted = await this.pantryRepository.deleteIngredient(
            validUserId,
            validIngredientId,
        );

        if (!deleted) {
            throw new NotFoundError(ERROR_CODES.INGREDIENT_NOT_FOUND_FOR_USER);
        }
    }
}
