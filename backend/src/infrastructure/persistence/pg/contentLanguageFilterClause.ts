import type { Locale } from "constants/locales";

import type { SqlFilterBuilder } from "infrastructure/persistence/pg/sqlFilterBuilder";

interface ContentLanguageFilter {
    languages?: Locale[];
}

// shared by the recipe and menu registries - both tables keep the column under the same name
export function contentLanguageFilterClause(tableAlias: string) {
    return {
        applies: (filters: ContentLanguageFilter) =>
            typeof filters.languages !== "undefined",
        apply: (builder: SqlFilterBuilder, filters: ContentLanguageFilter) => {
            const { languages } = filters;

            if (typeof languages === "undefined") {
                return;
            }

            builder.add(
                (bind) =>
                    `${tableAlias}.language = ANY(${bind(languages)}::text[])`,
            );
        },
    };
}
