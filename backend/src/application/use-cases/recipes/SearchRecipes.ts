import type { PaginatedResult } from "domain/repositories/pagination.types";
import type { RecipeRepository } from "domain/repositories/RecipeRepository";

import { idSchema } from "application/validation/common.schemas";
import { recipeFiltersSchema } from "application/validation/recipe.schemas";
import { validate } from "application/validation/validate";

export default class SearchRecipes {
    constructor(private recipeRepository: Pick<RecipeRepository, "search">) {}

    async execute(
        userId: number,
        filters: unknown,
    ): Promise<PaginatedResult<unknown>> {
        const validUserId = validate(idSchema, userId);
        const validFilters = validate(recipeFiltersSchema, filters);

        return this.recipeRepository.search(validUserId, validFilters);
    }
}
