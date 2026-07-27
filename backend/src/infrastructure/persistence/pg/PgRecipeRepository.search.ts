import type { Pool } from "pg";

import { PAGINATION } from "constants/pagination";
import type { PaginatedResult } from "domain/repositories/pagination.types";

import type { RecipeFilters } from "application/use-cases/recipes/recipe.types";

import { extractPaginatedRows } from "infrastructure/persistence/pg/pagination";

type QueryParam = string | number | number[];

interface RecipeSearchRow {
    id: number;
    title: string;
    content: string;
    person_id: number;
    type_id: number | null;
    creation_date: Date;
    cooking_time: number | null;
    type_name: string | null;
    ingredients: unknown;
    total_count: number;
}

const BASE_RECIPE_SELECT = `
        SELECT r.id, r.title, r.content, r.person_id, r.type_id, r.creation_date, r.cooking_time,
               rt.type_name, json_agg(json_build_object('id', i.id, 'name', i.name, 'allergens', i.allergens)) AS ingredients,
               -- cast: COUNT() is bigint, which pg returns as a string, not a number
               COUNT(*) OVER()::int AS total_count
        FROM recipes r
               LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
               LEFT JOIN ingredients i ON ri.ingredient_id = i.id
               LEFT JOIN recipe_types rt ON r.type_id = rt.id
      `;

function applyRecipeFilters(
    baseQuery: string,
    params: QueryParam[],
    startIndex: number,
    filters: RecipeFilters,
): string {
    let query = baseQuery;
    let paramIndex = startIndex;
    const {
        ingredient_ids,
        type_ids,
        start_date,
        end_date,
        min_cooking_time,
        max_cooking_time,
    } = filters;

    if (ingredient_ids) {
        // a separate EXISTS subquery (not a WHERE on the outer join) so a match doesn't strip
        // the recipe's other ingredients out of the json_agg below - OR semantics: any id matches
        query += ` AND EXISTS (
        SELECT 1 FROM recipe_ingredients ri2
        WHERE ri2.recipe_id = r.id AND ri2.ingredient_id = ANY($${paramIndex}::int[])
      )`;
        params.push(ingredient_ids.split(",").map(Number));
        paramIndex++;
    }

    if (type_ids) {
        query += ` AND r.type_id = ANY($${paramIndex}::int[])`;
        params.push(type_ids.split(",").map(Number));
        paramIndex++;
    }

    if (start_date && end_date) {
        query += ` AND r.creation_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        params.push(start_date, end_date);
        paramIndex += 2;
    } else if (start_date) {
        query += ` AND r.creation_date >= $${paramIndex}`;
        params.push(start_date);
        paramIndex++;
    } else if (end_date) {
        query += ` AND r.creation_date <= $${paramIndex}`;
        params.push(end_date);
        paramIndex++;
    }

    if (min_cooking_time) {
        query += ` AND r.cooking_time >= $${paramIndex}`;
        params.push(min_cooking_time);
        paramIndex++;
    }

    if (max_cooking_time) {
        query += ` AND r.cooking_time <= $${paramIndex}`;
        params.push(max_cooking_time);
    }

    return query;
}

// every branch ends with the ", id" tie-breaker so OFFSET pagination never duplicates or skips rows
function buildRecipeOrderBy(sortOrder?: "asc" | "desc"): string {
    if (sortOrder) {
        return ` ORDER BY r.cooking_time ${sortOrder === "asc" ? "ASC" : "DESC"}, r.id DESC`;
    }

    return ` ORDER BY r.creation_date DESC, r.id DESC`;
}

// shared tail of both searches: filters, grouping, ordering, and pagination applied on top of the caller's WHERE seed
async function runRecipeSearch(
    pool: Pool,
    whereSeed: string,
    params: QueryParam[],
    startIndex: number,
    parsed: RecipeFilters,
): Promise<PaginatedResult<unknown>> {
    let query = applyRecipeFilters(
        `${BASE_RECIPE_SELECT} ${whereSeed}`,
        params,
        startIndex,
        parsed,
    );

    query += ` GROUP BY r.id, rt.type_name`;
    query += buildRecipeOrderBy(parsed.sort_order);
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(
        parsed.limit ?? PAGINATION.DEFAULT_LIMIT,
        parsed.offset ?? PAGINATION.DEFAULT_OFFSET,
    );

    const result = await pool.query<RecipeSearchRow>(query, params);

    return extractPaginatedRows(result.rows);
}

export async function searchRecipes(
    pool: Pool,
    filters: unknown,
): Promise<PaginatedResult<unknown>> {
    const parsed: RecipeFilters = filters ?? {};

    return runRecipeSearch(pool, `WHERE 1=1`, [], 1, parsed);
}

export async function searchPersonRecipes(
    pool: Pool,
    personId: number,
    filters: unknown,
): Promise<PaginatedResult<unknown>> {
    const parsed: RecipeFilters = filters ?? {};

    return runRecipeSearch(
        pool,
        `WHERE r.person_id = $1`,
        [personId],
        2,
        parsed,
    );
}
