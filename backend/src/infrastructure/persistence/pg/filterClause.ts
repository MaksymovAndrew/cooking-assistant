import type { SqlFilterBuilder } from "./sqlFilterBuilder";

export interface ClauseContext {
    userId: number | null;
}

export interface FilterClause<Filters> {
    applies: (filters: Filters) => boolean;
    apply: (
        builder: SqlFilterBuilder,
        filters: Filters,
        context: ClauseContext,
    ) => void;
}

export function whenDefined<Filters, Key extends keyof Filters>(
    key: Key,
    add: (
        builder: SqlFilterBuilder,
        value: NonNullable<Filters[Key]> | (Filters[Key] & null),
    ) => void,
): FilterClause<Filters> {
    return {
        applies: (filters) => typeof filters[key] !== "undefined",
        apply: (builder, filters) => {
            const value = filters[key];

            if (typeof value !== "undefined") {
                add(builder, value);
            }
        },
    };
}
