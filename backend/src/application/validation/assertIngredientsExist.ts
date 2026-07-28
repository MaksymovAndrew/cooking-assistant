import { ERROR_MESSAGES } from "constants/errorMessages";
import { ValidationError } from "domain/errors/AppError";
import type { IngredientRepository } from "domain/repositories/IngredientRepository";

export async function assertIngredientsExist(
    ingredientRepository: Pick<IngredientRepository, "findExistingIds">,
    ingredientIds: number[],
): Promise<void> {
    if (ingredientIds.length === 0) return;

    const existingIds =
        await ingredientRepository.findExistingIds(ingredientIds);
    const existingSet = new Set(existingIds);

    if (!ingredientIds.every((id) => existingSet.has(id))) {
        throw new ValidationError(ERROR_MESSAGES.RECIPE_INGREDIENTS_NOT_EXIST);
    }
}
