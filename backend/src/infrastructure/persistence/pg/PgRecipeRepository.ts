import type { Pool } from "pg";

import type { Recipe } from "domain/entities/Recipe";
import type { PaginatedResult } from "domain/repositories/pagination.types";
import type { RecipeRepository } from "domain/repositories/RecipeRepository";

import {
    createRecipeInDb,
    updateRecipeInDb,
} from "./PgRecipeRepository.mutations";
import {
    findAllRecipeIngredients,
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
        currentUserId: number,
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

    async search(filters: unknown): Promise<PaginatedResult<unknown>> {
        return searchRecipes(this.pool, filters);
    }

    async searchByPerson(
        personId: number,
        filters: unknown,
    ): Promise<PaginatedResult<unknown>> {
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
    ): Promise<boolean> {
        const client = await this.pool.connect();

        try {
            await client.query("BEGIN");

            const owned = await client.query(
                `SELECT id FROM recipes WHERE id = $1 AND person_id = $2 FOR UPDATE`,
                [recipeId, personId],
            );

            if (owned.rowCount === 0) {
                await client.query("ROLLBACK");

                return false;
            }

            await client.query(`DELETE FROM menu_recipe WHERE recipe_id = $1`, [
                recipeId,
            ]);

            await client.query(
                `DELETE FROM recipe_ingredients WHERE recipe_id = $1`,
                [recipeId],
            );

            const result = await client.query(
                `DELETE FROM recipes WHERE id = $1 RETURNING *`,
                [recipeId],
            );

            await client.query("COMMIT");

            return Boolean(result.rowCount);
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async findAllIngredients(): Promise<unknown[]> {
        return findAllRecipeIngredients(this.pool);
    }

    async getStats(): Promise<unknown> {
        return getRecipeStats(this.pool);
    }
}
