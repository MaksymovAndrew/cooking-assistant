import type { MenuFilters } from "domain/repositories/menu.filters";

import {
    escapeLikePattern,
    type SqlFilterBuilder,
} from "infrastructure/persistence/pg/sqlFilterBuilder";

// apply() re-checks the same condition applies() already gated on - see the matching comment on
// RecipeFilterClause for why (applies() can't narrow filters for apply() as a plain predicate)
interface MenuFilterClause {
    applies: (filters: MenuFilters) => boolean;
    apply: (builder: SqlFilterBuilder, filters: MenuFilters) => void;
}

export const MENU_FILTER_CLAUSES: readonly MenuFilterClause[] = [
    {
        applies: (filters) => typeof filters.menu_name !== "undefined",
        apply: (builder, filters) => {
            const { menu_name } = filters;

            if (typeof menu_name === "undefined") {
                return;
            }

            const likePattern = `%${escapeLikePattern(menu_name)}%`;

            builder.add((bind) => `m.menu_title ILIKE ${bind(likePattern)}`);
        },
    },
    {
        applies: (filters) => typeof filters.category_ids !== "undefined",
        apply: (builder, filters) => {
            const { category_ids } = filters;

            if (typeof category_ids === "undefined") {
                return;
            }

            const ids = category_ids.split(",").map(Number);

            builder.add((bind) => `m.category_id = ANY(${bind(ids)}::int[])`);
        },
    },
];
