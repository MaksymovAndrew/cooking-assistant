import type { Locale } from "constants/locales";

import { whenDefined } from "./filterClause";

interface ContentLanguageFilter {
    languages?: Locale[];
}

export function contentLanguageFilterClause(tableAlias: string) {
    return whenDefined<ContentLanguageFilter, "languages">(
        "languages",
        (builder, languages) => {
            builder.add(
                (bind) =>
                    `${tableAlias}.language = ANY(${bind(languages)}::text[])`,
            );
        },
    );
}
