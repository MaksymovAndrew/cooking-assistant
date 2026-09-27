import type { Pool } from "pg";

import { PAGINATION } from "constants/pagination";
import type {
    MenuFilters,
    MenuSearchRow,
} from "domain/repositories/menu.filters";
import type { PaginatedResult } from "domain/repositories/pagination.types";

import { authorColumn } from "infrastructure/persistence/pg/authorColumn";
import { isFavouriteColumn } from "infrastructure/persistence/pg/isFavouriteColumn";
import { isOwnerColumn } from "infrastructure/persistence/pg/isOwnerColumn";
import { MENU_FILTER_CLAUSES } from "infrastructure/persistence/pg/menuFilterClauses";
import { extractPaginatedRows } from "infrastructure/persistence/pg/pagination";
import {
    ratingColumns,
    ratingSortOrder,
} from "infrastructure/persistence/pg/ratingColumns";
import { SqlFilterBuilder } from "infrastructure/persistence/pg/sqlFilterBuilder";

interface MenuSearchQueryRow extends MenuSearchRow {
    total_count: number;
}

// shared by both paginated list queries: menu_recipe joined for the per-menu recipe count needs this GROUP BY over every non-aggregated selected column
const MENU_LIST_GROUP_BY = ` GROUP BY m.menu_id, mc.category_name`;

// menu_id is the primary key, so ordering by it is already a deterministic tie-breaker
export const MENU_ORDER_BY = ` ORDER BY m.menu_id DESC`;

function buildMenuListSelect(ownerPlaceholder: string): string {
    return `
      SELECT
        m.menu_id AS id,
        m.menu_title AS title,
        mc.category_name AS categoryName,
        m.menu_content AS menuContent,
        m.language,
        m.photo_key,
        ${authorColumn("m")},
        ${isOwnerColumn("m", ownerPlaceholder)},
        ${isFavouriteColumn("menu", "m.menu_id", ownerPlaceholder)},
        ${ratingColumns("menu", "m", ownerPlaceholder)},
        COUNT(DISTINCT mr.recipe_id)::int AS recipe_count,
        -- cast: COUNT() is bigint, which pg returns as a string, not a number
        COUNT(*) OVER()::int AS total_count
      FROM menu m
             LEFT JOIN menu_category mc ON m.category_id = mc.menu_category_id
             LEFT JOIN menu_recipe mr ON mr.menu_id = m.menu_id
    `;
}

// shared tail of both menu list queries: filters, grouping, ordering, and pagination applied on top of the caller's WHERE seed
async function runMenuSearch(
    pool: Pool,
    builder: SqlFilterBuilder,
    filters: MenuFilters,
    userId: number | null,
): Promise<PaginatedResult<MenuSearchRow>> {
    const [ownerPlaceholder] = builder.bindTail(userId);

    for (const clause of MENU_FILTER_CLAUSES) {
        if (clause.applies(filters)) {
            clause.apply(builder, filters, { userId });
        }
    }

    const orderBy =
        filters.sort_order === "rating"
            ? ` ORDER BY ${ratingSortOrder("m")}, m.menu_id DESC`
            : MENU_ORDER_BY;
    let query = `${buildMenuListSelect(ownerPlaceholder)}${builder.whereClause()}${MENU_LIST_GROUP_BY}${orderBy}`;

    const [limitPlaceholder, offsetPlaceholder] = builder.bindTail(
        filters.limit ?? PAGINATION.DEFAULT_LIMIT,
        filters.offset ?? PAGINATION.DEFAULT_OFFSET,
    );

    query += ` LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`;

    const result = await pool.query<MenuSearchQueryRow>(
        query,
        builder.values(),
    );

    return extractPaginatedRows(result.rows);
}

export async function findAllMenus(
    pool: Pool,
    filters: MenuFilters,
    userId: number | null,
): Promise<PaginatedResult<MenuSearchRow>> {
    return runMenuSearch(pool, new SqlFilterBuilder(), filters, userId);
}

export async function searchPersonMenus(
    pool: Pool,
    personId: number,
    filters: MenuFilters,
): Promise<PaginatedResult<MenuSearchRow>> {
    return runMenuSearch(
        pool,
        new SqlFilterBuilder("m.person_id = $1", [personId]),
        filters,
        personId,
    );
}
