import type { Menu } from "domain/entities/Menu";
import type {
    MenuFilters,
    MenuSearchRow,
} from "domain/repositories/menu.filters";
import type { PaginatedResult } from "domain/repositories/pagination.types";
import type { DeletedRecord } from "domain/repositories/PhotoRepository";

export interface MenuRepository {
    findAll(
        filters: MenuFilters,
        userId: number | null,
    ): Promise<PaginatedResult<MenuSearchRow>>;
    findAllUnpaginated(): Promise<unknown[]>;
    create(menu: Menu, recipeIds: number[]): Promise<unknown>;
    findByIdWithRecipes(
        id: string | number,
        personId: number | null,
    ): Promise<unknown>;
    update(
        id: string | number,
        personId: number,
        menu: Menu,
        recipeIds: number[],
    ): Promise<boolean>;
    // null when the record doesn't exist or belongs to someone else
    deleteById(
        id: string | number,
        personId: number,
    ): Promise<DeletedRecord | null>;
    searchByPerson(
        personId: number,
        filters: MenuFilters,
    ): Promise<PaginatedResult<MenuSearchRow>>;
}
