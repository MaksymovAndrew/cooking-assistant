import type { PaginatedResult } from "domain/repositories/pagination.types";
import type { RecipeRepository } from "domain/repositories/RecipeRepository";

import { idSchema } from "application/validation/common.schemas";
import { recipeFiltersSchema } from "application/validation/recipe.schemas";
import { validate } from "application/validation/validate";

export default class SearchPersonRecipes {
    constructor(
        private recipeRepository: Pick<RecipeRepository, "searchByPerson">,
    ) {}

    async execute(
        personId: number,
        filters: unknown,
    ): Promise<PaginatedResult<unknown>> {
        const validPersonId = validate(idSchema, personId);
        const validFilters = validate(recipeFiltersSchema, filters);

        return this.recipeRepository.searchByPerson(
            validPersonId,
            validFilters,
        );
    }
}
