import type { RecipeRepository } from "domain/repositories/RecipeRepository";
import type { RecipeStatisticsDto } from "domain/repositories/recipeStats.types";

export default class GetRecipeStats {
    constructor(private recipeRepository: Pick<RecipeRepository, "getStats">) {}

    async execute(): Promise<RecipeStatisticsDto> {
        return this.recipeRepository.getStats();
    }
}
