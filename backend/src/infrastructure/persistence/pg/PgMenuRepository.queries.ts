import type { Pool } from "pg";

import { PAGINATION } from "constants/pagination";
import type {
    MenuFilters,
    MenuSearchRow,
} from "domain/repositories/menu.filters";
import type { PaginatedResult } from "domain/repositories/pagination.types";

import { MENU_FILTER_CLAUSES } from "infrastructure/persistence/pg/menuFilterClauses";
import { extractPaginatedRows } from "infrastructure/persistence/pg/pagination";
import { SqlFilterBuilder } from "infrastructure/persistence/pg/sqlFilterBuilder";

interface MenuSearchQueryRow extends MenuSearchRow {
    total_count: number;
}

// shared by both paginated list queries: menu_recipe joined for the per-menu recipe count needs this GROUP BY over every non-aggregated selected column
const MENU_LIST_GROUP_BY = ` GROUP BY m.menu_id, mc.category_name`;

// menu_id is the primary key, so ordering by it is already a deterministic tie-breaker
const MENU_ORDER_BY = ` ORDER BY m.menu_id DESC`;

// person_id itself never leaves the server - guests and other users have no business seeing an
// internal owner id, only whether the current viewer owns it, so isOwner is computed here instead
function buildMenuListSelect(ownerPlaceholder: string): string {
    return `
      SELECT
        m.menu_id AS id,
        m.menu_title AS title,
        mc.category_name AS categoryName,
        m.menu_content AS menuContent,
        COALESCE(m.person_id = ${ownerPlaceholder}, false) AS "isOwner",
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
            clause.apply(builder, filters);
        }
    }

    let query = `${buildMenuListSelect(ownerPlaceholder)}${builder.whereClause()}${MENU_LIST_GROUP_BY}${MENU_ORDER_BY}`;

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

interface MenuRow {
    id: number;
    title: string;
    categoryName: string;
    menuContent: string;
    recipe_count: number;
    total_cooking_time: number;
}

// unbounded, no filters/pagination - the statistics page needs every menu (incl. recipe count/total cooking time) for the averages and extremes
export async function findAllMenusUnpaginated(pool: Pool): Promise<unknown[]> {
    const result = await pool.query<MenuRow>(`
      SELECT
        m.menu_id AS id,
        m.menu_title AS title,
        mc.category_name AS categoryName,
        m.menu_content AS menuContent,
        COUNT(mr.recipe_id)::int AS recipe_count,
        COALESCE(SUM(r.cooking_time), 0)::int AS total_cooking_time
      FROM menu m
             LEFT JOIN menu_category mc ON m.category_id = mc.menu_category_id
             LEFT JOIN menu_recipe mr ON mr.menu_id = m.menu_id
             LEFT JOIN recipes r ON r.id = mr.recipe_id
      GROUP BY m.menu_id, mc.category_name
      ${MENU_ORDER_BY}
    `);

    return result.rows;
}
