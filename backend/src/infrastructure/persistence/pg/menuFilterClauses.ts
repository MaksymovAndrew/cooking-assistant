import type { MenuFilters } from "domain/repositories/menu.filters";

import { contentLanguageFilterClause } from "./contentLanguageFilterClause";
import { favouritesFilterClause } from "./favouritesFilterClause";
import { type FilterClause, whenDefined } from "./filterClause";
import { topRatedFilterClause } from "./ratingColumns";
import { escapeLikePattern } from "./sqlFilterBuilder";

export const MENU_FILTER_CLAUSES: readonly FilterClause<MenuFilters>[] = [
    whenDefined("menu_name", (builder, menuName) => {
        const likePattern = `%${escapeLikePattern(menuName)}%`;

        builder.add((bind) => `m.menu_title ILIKE ${bind(likePattern)}`);
    }),
    whenDefined("category_ids", (builder, categoryIds) => {
        const ids = categoryIds.split(",").map(Number);

        builder.add((bind) => `m.category_id = ANY(${bind(ids)}::int[])`);
    }),
    favouritesFilterClause("menu", "m.menu_id"),
    topRatedFilterClause("m"),
    contentLanguageFilterClause("m"),
];
