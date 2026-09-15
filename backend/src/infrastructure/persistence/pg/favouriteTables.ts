import type { FavouriteTarget } from "domain/repositories/FavouriteRepository";

interface FavouriteTable {
    table: string;
    targetColumn: string;
    sourceTable: string;
    sourceIdColumn: string;
}

// fixed identifiers, never request input - the only thing favourite SQL interpolates
export const FAVOURITE_TABLES = {
    recipe: {
        table: "recipe_favourites",
        targetColumn: "recipe_id",
        sourceTable: "recipes",
        sourceIdColumn: "id",
    },
    menu: {
        table: "menu_favourites",
        targetColumn: "menu_id",
        sourceTable: "menu",
        sourceIdColumn: "menu_id",
    },
} satisfies Record<FavouriteTarget, FavouriteTable>;
