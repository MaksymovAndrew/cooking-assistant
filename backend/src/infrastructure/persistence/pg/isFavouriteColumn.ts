import type { FavouriteTarget } from "domain/repositories/FavouriteRepository";

import { FAVOURITE_TABLES } from "./favouriteTables";

// null for a guest, so a server-rendered page tells guests apart without a session check
export function isFavouriteColumn(
    target: FavouriteTarget,
    targetIdExpression: string,
    userPlaceholder: string,
): string {
    const { table, targetColumn } = FAVOURITE_TABLES[target];

    return `CASE WHEN ${userPlaceholder}::int IS NULL THEN NULL
                ELSE EXISTS (
                    SELECT 1 FROM ${table} fav
                    WHERE fav.person_id = ${userPlaceholder}::int AND fav.${targetColumn} = ${targetIdExpression}
                )
            END AS "isFavourite"`;
}
