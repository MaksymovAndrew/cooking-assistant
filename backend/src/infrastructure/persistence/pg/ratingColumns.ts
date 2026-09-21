import { RATING_LIMITS, RATING_SORT_PRIOR } from "constants/ratings";
import type { RatingTarget } from "domain/repositories/RatingRepository";

import { RATING_TABLES } from "infrastructure/persistence/pg/ratingTables";
import type { SqlFilterBuilder } from "infrastructure/persistence/pg/sqlFilterBuilder";

// the average is derived from the running totals, never stored: null for an unrated record, not a fake 0.
// Unrounded, so a page can shift it exactly the moment the viewer votes; the client rounds for display
export function ratingSummaryColumns(tableAlias: string): string {
    return `${tableAlias}.rating_sum::float8 / NULLIF(${tableAlias}.rating_count, 0) AS "ratingAverage",
            ${tableAlias}.rating_count AS "ratingCount"`;
}

// myRating is null for a guest and for a viewer who hasn't voted
export function ratingColumns(
    target: RatingTarget,
    tableAlias: string,
    userPlaceholder: string,
): string {
    const { table, targetColumn, sourceIdColumn } = RATING_TABLES[target];

    return `${ratingSummaryColumns(tableAlias)},
            (
                SELECT rt.value FROM ${table} rt
                WHERE rt.person_id = ${userPlaceholder}::int AND rt.${targetColumn} = ${tableAlias}.${sourceIdColumn}
            ) AS "myRating"`;
}

const { PRIOR_VOTES, PRIOR_MEAN } = RATING_SORT_PRIOR;

// the Bayesian average (sum + m*C) / (count + m); the vote count breaks ties between equal scores
export function ratingSortOrder(tableAlias: string): string {
    return `(${tableAlias}.rating_sum + ${PRIOR_VOTES * PRIOR_MEAN})::numeric / (${tableAlias}.rating_count + ${PRIOR_VOTES}) DESC, ${tableAlias}.rating_count DESC`;
}

interface TopRatedFilter {
    top_rated?: boolean;
}

// shared by the recipe and menu registries; compares the same plain average a card shows
export function topRatedFilterClause(tableAlias: string) {
    return {
        applies: (filters: TopRatedFilter) => filters.top_rated === true,
        apply: (builder: SqlFilterBuilder) => {
            builder.add(
                () =>
                    `${tableAlias}.rating_count > 0 AND ${tableAlias}.rating_sum >= ${RATING_LIMITS.TOP_RATED_AVERAGE} * ${tableAlias}.rating_count`,
            );
        },
    };
}
