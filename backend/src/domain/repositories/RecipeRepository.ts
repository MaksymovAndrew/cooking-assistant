import type { Recipe } from "domain/entities/Recipe";

import type { PaginatedResult } from "./pagination.types";
import type { DeletedRecord } from "./PhotoRepository";
import type { RecipeFilters, RecipeSearchRow } from "./recipe.filters";
import type { RecipeDetailRow, RecipeRow } from "./recipe.types";
import type { RecipeStatisticsDto } from "./recipeStats.types";

export interface RecipeRepository {
    create(recipe: Recipe): Promise<RecipeRow>;
    findByIdWithIngredients(
        id: number,
        currentUserId: number | null,
    ): Promise<RecipeDetailRow | null>;
    // null when the record doesn't exist or belongs to someone else
    update(
        id: number,
        personId: number,
        data: Recipe,
    ): Promise<RecipeRow | null>;
    deleteById(id: number, personId: number): Promise<DeletedRecord | null>;
    search(
        userId: number | null,
        filters: RecipeFilters,
    ): Promise<PaginatedResult<RecipeSearchRow>>;
    searchByPerson(
        personId: number,
        filters: RecipeFilters,
    ): Promise<PaginatedResult<RecipeSearchRow>>;
    findExistingIds(ids: number[]): Promise<number[]>;
    getStats(): Promise<RecipeStatisticsDto>;
}
