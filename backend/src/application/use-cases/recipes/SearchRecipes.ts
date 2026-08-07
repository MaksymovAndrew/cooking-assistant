import { ERROR_MESSAGES } from "constants/errorMessages";
import { ValidationError } from "domain/errors/AppError";
import type { PaginatedResult } from "domain/repositories/pagination.types";
import type { RecipeRepository } from "domain/repositories/RecipeRepository";

import { idSchema } from "application/validation/common.schemas";
import { recipeFiltersSchema } from "application/validation/recipe.schemas";
import { validate } from "application/validation/validate";

export default class SearchRecipes {
    constructor(private recipeRepository: Pick<RecipeRepository, "search">) {}

    async execute(
        userId: number | null,
        filters: unknown,
    ): Promise<PaginatedResult<unknown>> {
        const validFilters = validate(recipeFiltersSchema, filters);

        if (userId === null) {
            if (validFilters.in_pantry) {
                throw new ValidationError(
                    ERROR_MESSAGES.RECIPE_IN_PANTRY_REQUIRES_LOGIN,
                );
            }

            return this.recipeRepository.search(null, validFilters);
        }

        const validUserId = validate(idSchema, userId);

        return this.recipeRepository.search(validUserId, validFilters);
    }
}
