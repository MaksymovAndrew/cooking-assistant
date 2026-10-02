import type { Pool } from "pg";

import type { Menu } from "domain/entities/Menu";
import type {
    MenuFilters,
    MenuSearchRow,
} from "domain/repositories/menu.filters";
import type { MenuDetail, MenuStatsRow } from "domain/repositories/menu.types";
import type { MenuRepository } from "domain/repositories/MenuRepository";
import type { PaginatedResult } from "domain/repositories/pagination.types";
import type { DeletedRecord } from "domain/repositories/PhotoRepository";

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

    async findAllUnpaginated(): Promise<MenuStatsRow[]> {
        return findAllMenusUnpaginated(this.pool);
    }

    async create(menu: Menu, recipeIds: number[]): Promise<number> {
        return createMenuInDb(this.pool, menu, recipeIds);
    }

    async update(
        id: number,
        personId: number,
        menu: Menu,
        recipeIds: number[],
    ): Promise<boolean> {
        return updateMenuInDb(this.pool, id, personId, menu, recipeIds);
    }

    async findByIdWithRecipes(
        id: number,
        personId: number | null,
    ): Promise<MenuDetail | null> {
        return findMenuByIdWithRecipes(this.pool, id, personId);
    }

    // one statement: its recipe links, favourites and ratings cascade, and the photo key comes back from the delete itself
    async deleteById(
        id: number,
        personId: number,
    ): Promise<DeletedRecord | null> {
        const result = await this.pool.query<{ photo_key: string | null }>(
            "DELETE FROM menu WHERE menu_id = $1 AND person_id = $2 RETURNING photo_key",
            [id, personId],
        );

        return result.rows.length === 0
            ? null
            : { photoKey: result.rows[0].photo_key };
    }

    async searchByPerson(
        personId: number,
        filters: MenuFilters,
    ): Promise<PaginatedResult<MenuSearchRow>> {
        return searchPersonMenus(this.pool, personId, filters);
    }
}
