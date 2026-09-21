import type { Pool } from "pg";

import type { Menu } from "domain/entities/Menu";
import type {
    MenuFilters,
    MenuSearchRow,
} from "domain/repositories/menu.filters";
import type { MenuRepository } from "domain/repositories/MenuRepository";
import type { PaginatedResult } from "domain/repositories/pagination.types";

import { findMenuByIdWithRecipes } from "./PgMenuRepository.detail";
import { createMenuInDb, updateMenuInDb } from "./PgMenuRepository.mutations";
import { findAllMenus, searchPersonMenus } from "./PgMenuRepository.queries";
import { findAllMenusUnpaginated } from "./PgMenuRepository.stats";

export default class PgMenuRepository implements MenuRepository {
    constructor(private pool: Pool) {}

    async findAll(
        filters: MenuFilters,
        userId: number | null,
    ): Promise<PaginatedResult<MenuSearchRow>> {
        return findAllMenus(this.pool, filters, userId);
    }

    async findAllUnpaginated(): Promise<unknown[]> {
        return findAllMenusUnpaginated(this.pool);
    }

    async create(menu: Menu, recipeIds: number[]): Promise<unknown> {
        return createMenuInDb(this.pool, menu, recipeIds);
    }

    async update(
        id: string | number,
        personId: number,
        menu: Menu,
        recipeIds: number[],
    ): Promise<boolean> {
        return updateMenuInDb(this.pool, id, personId, menu, recipeIds);
    }

    async findByIdWithRecipes(
        id: string | number,
        personId: number | null,
    ): Promise<unknown> {
        return findMenuByIdWithRecipes(this.pool, id, personId);
    }

    async deleteById(id: string | number, personId: number): Promise<boolean> {
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
        filters: MenuFilters,
    ): Promise<PaginatedResult<MenuSearchRow>> {
        return searchPersonMenus(this.pool, personId, filters);
    }
}
