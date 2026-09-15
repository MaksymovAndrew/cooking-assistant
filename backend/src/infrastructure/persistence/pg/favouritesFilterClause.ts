import type { FavouriteTarget } from "domain/repositories/FavouriteRepository";

import { FAVOURITE_TABLES } from "infrastructure/persistence/pg/favouriteTables";
import type { SqlFilterBuilder } from "infrastructure/persistence/pg/sqlFilterBuilder";

interface FavouritesFilter {
    favourites?: boolean;
}

// shared by the recipe and menu registries - the clause differs only in which table and id it joins
export function favouritesFilterClause(
    target: FavouriteTarget,
    targetIdExpression: string,
) {
    const { table, targetColumn } = FAVOURITE_TABLES[target];

    return {
        applies: (filters: FavouritesFilter) => filters.favourites === true,
        apply: (
            builder: SqlFilterBuilder,
            _filters: FavouritesFilter,
            context: { userId: number | null },
        ) => {
            // guests are rejected before the query is built - this only narrows userId for bind()
            const { userId } = context;

            if (userId === null) {
                return;
            }

            builder.add(
                (bind) =>
                    `EXISTS (SELECT 1 FROM ${table} fav WHERE fav.${targetColumn} = ${targetIdExpression} AND fav.person_id = ${bind(userId)})`,
            );
        },
    };
}
