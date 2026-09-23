import type { Pool } from "pg";

import type { Recipe } from "domain/entities/Recipe";
import type { PaginatedResult } from "domain/repositories/pagination.types";
import type { DeletedRecord } from "domain/repositories/PhotoRepository";
import type {
    RecipeFilters,
    RecipeSearchRow,
} from "domain/repositories/recipe.filters";
import type { RecipeRepository } from "domain/repositories/RecipeRepository";
import type { RecipeStatisticsDto } from "domain/repositories/recipeStats.types";

import { deleteRecipeById } from "./PgRecipeRepository.delete";
import {
    createRecipeInDb,
    updateRecipeInDb,
} from "./PgRecipeRepository.mutations";
import {
    findAllRecipes,
    findRecipeByIdWithIngredients,
} from "./PgRecipeRepository.reads";
import {
    searchPersonRecipes,
    searchRecipes,
} from "./PgRecipeRepository.search";
import { getRecipeStats } from "./PgRecipeRepository.stats";

interface RecipeIdRow {
    id: number;
}

export default class PgRecipeRepository implements RecipeRepository {
    constructor(private pool: Pool) {}

    async create(recipe: Recipe): Promise<unknown> {
        return createRecipeInDb(this.pool, recipe);
    }

    async findAllWithIngredients(): Promise<unknown[]> {
        return findAllRecipes(this.pool);
    }

    async findByIdWithIngredients(
        recipeId: string | number,
        currentUserId: number | null,
    ): Promise<unknown> {
        return findRecipeByIdWithIngredients(
            this.pool,
            recipeId,
            currentUserId,
        );
    }

    async update(
        recipeId: string | number,
        personId: number,
        data: Recipe,
    ): Promise<unknown> {
        return updateRecipeInDb(this.pool, recipeId, personId, data);
    }

    async search(
        userId: number | null,
        filters: RecipeFilters,
    ): Promise<PaginatedResult<RecipeSearchRow>> {
        return searchRecipes(this.pool, userId, filters);
    }

    async searchByPerson(
        personId: number,
        filters: RecipeFilters,
    ): Promise<PaginatedResult<RecipeSearchRow>> {
        return searchPersonRecipes(this.pool, personId, filters);
    }

    async findExistingIds(ids: number[]): Promise<number[]> {
        const result = await this.pool.query<RecipeIdRow>(
            `SELECT id FROM recipes WHERE id = ANY($1)`,
            [ids],
        );

        return result.rows.map((row) => row.id);
    }

    async deleteById(
        recipeId: string | number,
        personId: number,
    ): Promise<DeletedRecord | null> {
        return deleteRecipeById(this.pool, recipeId, personId);
    }

    async getStats(): Promise<RecipeStatisticsDto> {
        return getRecipeStats(this.pool);
    }
}
