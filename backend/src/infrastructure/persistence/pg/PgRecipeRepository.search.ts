import type { Pool } from "pg";

import { PAGINATION } from "constants/pagination";
import type { PaginatedResult } from "domain/repositories/pagination.types";
import type {
    RecipeFilters,
    RecipeSearchRow,
} from "domain/repositories/recipe.filters";

import { extractPaginatedRows } from "infrastructure/persistence/pg/pagination";
import { RECIPE_FILTER_CLAUSES } from "infrastructure/persistence/pg/recipeFilterClauses";
import { SqlFilterBuilder } from "infrastructure/persistence/pg/sqlFilterBuilder";

interface RecipeSearchQueryRow extends RecipeSearchRow {
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
    builder: SqlFilterBuilder,
    filters: RecipeFilters,
    userId: number,
): Promise<PaginatedResult<RecipeSearchRow>> {
    for (const clause of RECIPE_FILTER_CLAUSES) {
        if (clause.applies(filters)) {
            clause.apply(builder, filters, { userId });
        }
    }

    let query = `${BASE_RECIPE_SELECT}${builder.whereClause()} GROUP BY r.id, rt.type_name`;

    query += buildRecipeOrderBy(filters.sort_order);

    const [limitPlaceholder, offsetPlaceholder] = builder.bindTail(
        filters.limit ?? PAGINATION.DEFAULT_LIMIT,
        filters.offset ?? PAGINATION.DEFAULT_OFFSET,
    );

    query += ` LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`;

    const result = await pool.query<RecipeSearchQueryRow>(
        query,
        builder.values(),
    );

    return extractPaginatedRows(result.rows);
}

export async function searchRecipes(
    pool: Pool,
    userId: number,
    filters: RecipeFilters,
): Promise<PaginatedResult<RecipeSearchRow>> {
    return runRecipeSearch(pool, new SqlFilterBuilder(), filters, userId);
}

export async function searchPersonRecipes(
    pool: Pool,
    personId: number,
    filters: RecipeFilters,
): Promise<PaginatedResult<RecipeSearchRow>> {
    return runRecipeSearch(
        pool,
        new SqlFilterBuilder("r.person_id = $1", [personId]),
        filters,
        personId,
    );
}
