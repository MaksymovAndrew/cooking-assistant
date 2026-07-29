import type { Recipe } from "domain/entities/Recipe";
import type { PaginatedResult } from "domain/repositories/pagination.types";
import type {
    RecipeFilters,
    RecipeSearchRow,
} from "domain/repositories/recipe.filters";

export interface RecipeRepository {
    create(recipe: Recipe): Promise<unknown>;
    findAllWithIngredients(): Promise<unknown[]>;
    findByIdWithIngredients(
        id: string | number,
        currentUserId: number,
    ): Promise<unknown>;
    update(
        id: string | number,
        personId: number,
        data: Recipe,
    ): Promise<unknown>;
    deleteById(id: string | number, personId: number): Promise<unknown>;
    search(
        userId: number,
        filters: RecipeFilters,
    ): Promise<PaginatedResult<RecipeSearchRow>>;
    searchByPerson(
        personId: number,
        filters: RecipeFilters,
    ): Promise<PaginatedResult<RecipeSearchRow>>;
    findExistingIds(ids: number[]): Promise<number[]>;
    getStats(): Promise<unknown>;
}
