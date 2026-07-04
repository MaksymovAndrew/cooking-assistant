import type { Pool } from "pg";

import type { Menu } from "domain/entities/Menu";
import type { MenuRepository } from "domain/repositories/MenuRepository";
import type { PaginatedResult } from "domain/repositories/pagination.types";

import { findMenuByIdWithRecipes } from "./PgMenuRepository.detail";
import {
    findAllMenus,
    findAllMenusUnpaginated,
    searchPersonMenus,
} from "./PgMenuRepository.queries";

interface MenuIdRow {
    menu_id: number;
}

export default class PgMenuRepository implements MenuRepository {
    constructor(private pool: Pool) {}

    private buildMenuRecipeInsert(
        menuId: number | string,
        recipeIds: number[],
    ): { placeholders: string; params: (number | string)[] } {
        const placeholders = recipeIds
            .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
            .join(", ");
        const params = recipeIds.flatMap((recipeId) => [menuId, recipeId]);

        return { placeholders, params };
    }

    async findAll(filters: unknown): Promise<PaginatedResult<unknown>> {
        return findAllMenus(this.pool, filters);
    }

    async findAllUnpaginated(): Promise<unknown[]> {
        return findAllMenusUnpaginated(this.pool);
    }

    async create(
        { menuTitle, menuContent, categoryId, personId }: Menu,
        recipeIds: number[],
    ): Promise<unknown> {
        const client = await this.pool.connect();

        try {
            await client.query("BEGIN");

            const menuResult = await client.query<MenuIdRow>(
                `INSERT INTO menu (menu_title, menu_content, category_id, person_id)
             VALUES ($1, $2, $3, $4)
             RETURNING menu_id`,
                [menuTitle, menuContent, categoryId, personId],
            );
            const menuId = menuResult.rows[0].menu_id;

            if (recipeIds.length > 0) {
                const { placeholders, params } = this.buildMenuRecipeInsert(
                    menuId,
                    recipeIds,
                );

                await client.query(
                    `INSERT INTO menu_recipe (menu_id, recipe_id) VALUES ${placeholders}`,
                    params,
                );
            }

            await client.query("COMMIT");

            return menuId;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async update(
        id: string | number,
        personId: number,
        { menuTitle, menuContent, categoryId }: Menu,
        recipeIds: number[],
    ): Promise<boolean> {
        const client = await this.pool.connect();

        try {
            await client.query("BEGIN");

            const result = await client.query(
                `UPDATE menu
      SET menu_title = $1, menu_content = $2, category_id = $3
      WHERE menu_id = $4 AND person_id = $5`,
                [menuTitle, menuContent, categoryId, id, personId],
            );

            if (result.rowCount === 0) {
                await client.query("ROLLBACK");

                return false;
            }

            await client.query("DELETE FROM menu_recipe WHERE menu_id = $1", [
                id,
            ]);

            if (recipeIds.length > 0) {
                const { placeholders, params } = this.buildMenuRecipeInsert(
                    id,
                    recipeIds,
                );

                await client.query(
                    `INSERT INTO menu_recipe (menu_id, recipe_id) VALUES ${placeholders}`,
                    params,
                );
            }

            await client.query("COMMIT");

            return true;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async findByIdWithRecipes(
        id: string | number,
        personId: number,
    ): Promise<unknown> {
        return findMenuByIdWithRecipes(this.pool, id, personId);
    }

    async deleteById(id: string | number, personId: number): Promise<unknown> {
        // explicit delete: legacy database.sql adopters carry a second menu_id FK without CASCADE
        const client = await this.pool.connect();

        try {
            await client.query("BEGIN");

            const owned = await client.query(
                "SELECT menu_id FROM menu WHERE menu_id = $1 AND person_id = $2 FOR UPDATE",
                [id, personId],
            );

            if (owned.rowCount === 0) {
                await client.query("ROLLBACK");

                return false;
            }

            await client.query("DELETE FROM menu_recipe WHERE menu_id = $1", [
                id,
            ]);
            await client.query("DELETE FROM menu WHERE menu_id = $1", [id]);

            await client.query("COMMIT");

            return true;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async searchByPerson(
        personId: number,
        filters: unknown,
    ): Promise<PaginatedResult<unknown>> {
        return searchPersonMenus(this.pool, personId, filters);
    }
}
