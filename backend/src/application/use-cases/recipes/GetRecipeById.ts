import { ERROR_MESSAGES } from "constants/errorMessages";
import { NotFoundError } from "domain/errors/AppError";
import type { RecipeRepository } from "domain/repositories/RecipeRepository";

import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

export default class GetRecipeById {
    constructor(
        private recipeRepository: Pick<
            RecipeRepository,
            "findByIdWithIngredients"
        >,
    ) {}

    async execute(
        id: string | number,
        currentUserId: number | null,
    ): Promise<unknown> {
        const recipeId = validate(idSchema, id);
        const recipe = await this.recipeRepository.findByIdWithIngredients(
            recipeId,
            currentUserId,
        );

        if (!recipe) {
            throw new NotFoundError(ERROR_MESSAGES.RECIPE_NOT_FOUND);
        }

        return recipe;
    }
}
