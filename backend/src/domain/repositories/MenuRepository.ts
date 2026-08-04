import type { Menu } from "domain/entities/Menu";
import type {
    MenuFilters,
    MenuSearchRow,
} from "domain/repositories/menu.filters";
import type { PaginatedResult } from "domain/repositories/pagination.types";

export interface MenuRepository {
    findAll(filters: MenuFilters): Promise<PaginatedResult<MenuSearchRow>>;
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
    deleteById(id: string | number, personId: number): Promise<unknown>;
    searchByPerson(
        personId: number,
        filters: MenuFilters,
    ): Promise<PaginatedResult<MenuSearchRow>>;
}
