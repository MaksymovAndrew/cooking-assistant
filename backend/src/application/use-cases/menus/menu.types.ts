import type { MenuInput, MenuUpdateInput } from "domain/entities/Menu";

export type CreateMenuInput = MenuInput & { recipeIds: number[] };
export type UpdateMenuInput = MenuUpdateInput & { recipeIds: number[] };

export type { MenuFilters } from "domain/repositories/menu.filters";
