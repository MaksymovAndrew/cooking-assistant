import type { Menu } from "domain/entities/Menu";

import type { MenuFilters, MenuSearchRow } from "./menu.filters";
import type { MenuDetail, MenuStatsRow } from "./menu.types";
import type { PaginatedResult } from "./pagination.types";
import type { DeletedRecord } from "./PhotoRepository";

export interface MenuRepository {
    findAll(
        filters: MenuFilters,
        userId: number | null,
    ): Promise<PaginatedResult<MenuSearchRow>>;
    findAllUnpaginated(): Promise<MenuStatsRow[]>;
    // the new menu's id
    create(menu: Menu, recipeIds: number[]): Promise<number>;
    findByIdWithRecipes(
        id: number,
        personId: number | null,
    ): Promise<MenuDetail | null>;
    update(
        id: number,
        personId: number,
        menu: Menu,
        recipeIds: number[],
    ): Promise<boolean>;
    // null when the record doesn't exist or belongs to someone else
    deleteById(id: number, personId: number): Promise<DeletedRecord | null>;
    searchByPerson(
        personId: number,
        filters: MenuFilters,
    ): Promise<PaginatedResult<MenuSearchRow>>;
}
