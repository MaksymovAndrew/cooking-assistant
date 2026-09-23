import type { RatingTarget } from "domain/repositories/RatingRepository";

interface RatingTable {
    table: string;
    targetColumn: string;
    sourceTable: string;
    sourceIdColumn: string;
}

// fixed identifiers, never request input - the only thing rating SQL interpolates
export const RATING_TABLES = {
    recipe: {
        table: "recipe_ratings",
        targetColumn: "recipe_id",
        sourceTable: "recipes",
        sourceIdColumn: "id",
    },
    menu: {
        table: "menu_ratings",
        targetColumn: "menu_id",
        sourceTable: "menu",
        sourceIdColumn: "menu_id",
    },
} satisfies Record<RatingTarget, RatingTable>;
