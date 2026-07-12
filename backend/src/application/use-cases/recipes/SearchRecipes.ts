import type { PaginatedResult } from "domain/repositories/pagination.types";
import type { RecipeRepository } from "domain/repositories/RecipeRepository";

import { recipeFiltersSchema } from "application/validation/recipe.schemas";
import { validate } from "application/validation/validate";

export default class SearchRecipes {
    constructor(private recipeRepository: Pick<RecipeRepository, "search">) {}

    async execute(filters: unknown): Promise<PaginatedResult<unknown>> {
        const validFilters = validate(recipeFiltersSchema, filters);

        return this.recipeRepository.search(validFilters);
    }
}
