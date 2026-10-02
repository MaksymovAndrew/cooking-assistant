import type { SqlFilterBuilder } from "./sqlFilterBuilder";

export interface ClauseContext {
    userId: number | null;
}

// one entry of a list's filter registry: applies() gates it, apply() writes its condition
export interface FilterClause<Filters> {
    applies: (filters: Filters) => boolean;
    apply: (
        builder: SqlFilterBuilder,
        filters: Filters,
        context: ClauseContext,
    ) => void;
}

// the common case, a clause on one optional field: apply gets the value already narrowed
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
