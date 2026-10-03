import { RATING_LIMITS, RATING_SORT_PRIOR } from "constants/ratings";
import type { RatingTarget } from "domain/repositories/RatingRepository";

import { RATING_TABLES } from "./ratingTables";
import type { SqlFilterBuilder } from "./sqlFilterBuilder";

// null when unrated, not a fake 0; unrounded so a page can shift it exactly on a vote
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

// the Bayesian average (sum + m*C) / (count + m)
export function ratingSortOrder(tableAlias: string): string {
    return `(${tableAlias}.rating_sum + ${PRIOR_VOTES * PRIOR_MEAN})::numeric / (${tableAlias}.rating_count + ${PRIOR_VOTES}) DESC, ${tableAlias}.rating_count DESC`;
}

interface TopRatedFilter {
    top_rated?: boolean;
}

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
