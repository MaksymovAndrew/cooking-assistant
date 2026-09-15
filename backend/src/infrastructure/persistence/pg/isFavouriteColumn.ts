import type { FavouriteTarget } from "domain/repositories/FavouriteRepository";

import { FAVOURITE_TABLES } from "infrastructure/persistence/pg/favouriteTables";

// null for an anonymous requester - unknown rather than false - so a server-rendered page can tell a guest
// from a signed-in visitor straight from the record, without waiting on a client-side session check
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
