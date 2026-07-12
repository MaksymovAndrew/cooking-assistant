import type { Recipe } from "domain/entities/Recipe";
import type { PaginatedResult } from "domain/repositories/pagination.types";

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
    search(filters: unknown): Promise<PaginatedResult<unknown>>;
    searchByPerson(
        personId: number,
        filters: unknown,
    ): Promise<PaginatedResult<unknown>>;
    findExistingIds(ids: number[]): Promise<number[]>;
    getStats(): Promise<unknown>;
    findAllIngredients(): Promise<unknown[]>;
}
