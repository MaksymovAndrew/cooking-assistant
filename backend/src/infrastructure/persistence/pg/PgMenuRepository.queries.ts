import type { Pool } from "pg";

import { PAGINATION } from "constants/pagination";
import type { PaginatedResult } from "domain/repositories/pagination.types";

import type { MenuFilters } from "application/use-cases/menus/menu.types";

import { extractPaginatedRows } from "infrastructure/persistence/pg/pagination";

type QueryParam = string | number | number[];

interface MenuListRow {
    id: number;
    title: string;
    categoryName: string;
    menuContent: string;
    total_count: number;
}

// menu_id is the primary key, so ordering by it is already a deterministic tie-breaker
const MENU_ORDER_BY = ` ORDER BY m.menu_id DESC`;

// shared tail of both menu list queries: ordering and pagination appended to
// the caller-assembled WHERE, then the paginated rows unwrapped
async function runPaginatedMenuQuery(
    pool: Pool,
    baseQuery: string,
    queryParams: QueryParam[],
    limit: number | undefined,
    offset: number | undefined,
): Promise<PaginatedResult<unknown>> {
    let query = baseQuery + MENU_ORDER_BY;

    query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(
        limit ?? PAGINATION.DEFAULT_LIMIT,
        offset ?? PAGINATION.DEFAULT_OFFSET,
    );

    const result = await pool.query<MenuListRow>(query, queryParams);

    return extractPaginatedRows(result.rows);
}

export async function findAllMenus(
    pool: Pool,
    filters: unknown,
): Promise<PaginatedResult<unknown>> {
    const { menu_name, category_ids, limit, offset }: MenuFilters =
        filters ?? {};

    let query = `
      SELECT
        m.menu_id AS id,
        m.menu_title AS title,
        mc.category_name AS categoryName,
        m.menu_content AS menuContent,
        -- cast: COUNT() is bigint, which pg returns as a string, not a number
        COUNT(*) OVER()::int AS total_count
      FROM menu m
             LEFT JOIN menu_category mc ON m.category_id = mc.menu_category_id
    `;

    const queryParams: QueryParam[] = [];

    if (menu_name) {
        query += ` WHERE m.menu_title ILIKE $${queryParams.length + 1}`;
        queryParams.push(`%${menu_name}%`);
    }

    if (category_ids) {
        const categoryArray = category_ids.split(",").map(Number);

        if (menu_name) {
            query += ` AND m.category_id = ANY($${queryParams.length + 1})`;
        } else {
            query += ` WHERE m.category_id = ANY($${queryParams.length + 1})`;
        }
        queryParams.push(categoryArray);
    }

    return runPaginatedMenuQuery(pool, query, queryParams, limit, offset);
}

export async function searchPersonMenus(
    pool: Pool,
    personId: number,
    filters: unknown,
): Promise<PaginatedResult<unknown>> {
    const { menu_name, category_ids, limit, offset }: MenuFilters =
        filters ?? {};

    let query = `
      SELECT
        m.menu_id AS id,
        m.menu_title AS title,
        mc.category_name AS categoryName,
        m.menu_content AS menuContent,
        -- cast: COUNT() is bigint, which pg returns as a string, not a number
        COUNT(*) OVER()::int AS total_count
      FROM menu m
      LEFT JOIN menu_category mc ON m.category_id = mc.menu_category_id
      WHERE m.person_id = $1
    `;

    const queryParams: QueryParam[] = [personId];

    if (menu_name) {
        query += ` AND m.menu_title ILIKE $${queryParams.length + 1}`;
        queryParams.push(`%${menu_name}%`);
    }

    if (category_ids) {
        const categoryArray = category_ids.split(",").map(Number);

        query += ` AND m.category_id = ANY($${queryParams.length + 1})`;
        queryParams.push(categoryArray);
    }

    return runPaginatedMenuQuery(pool, query, queryParams, limit, offset);
}

interface MenuRow {
    id: number;
    title: string;
    categoryName: string;
    menuContent: string;
}

// unbounded, no filters/pagination - mirrors PgRecipeRepository's
// findAllRecipes, used by the statistics page which needs every menu
export async function findAllMenusUnpaginated(pool: Pool): Promise<unknown[]> {
    const result = await pool.query<MenuRow>(`
      SELECT
        m.menu_id AS id,
        m.menu_title AS title,
        mc.category_name AS categoryName,
        m.menu_content AS menuContent
      FROM menu m
             LEFT JOIN menu_category mc ON m.category_id = mc.menu_category_id
      ${MENU_ORDER_BY}
    `);

    return result.rows;
}
