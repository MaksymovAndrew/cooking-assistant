import type { Pool } from "pg";

import { PAGINATION } from "constants/pagination";
import type { PaginatedResult } from "domain/repositories/pagination.types";
import type {
    RecipeFilters,
    RecipeSearchRow,
} from "domain/repositories/recipe.filters";

import { authorColumn } from "./authorColumn";
import { caloriesPerPortion } from "./calorieColumns";
import { containsAvoidedColumn } from "./containsAvoidedColumn";
import { isFavouriteColumn } from "./isFavouriteColumn";
import { isOwnerColumn } from "./isOwnerColumn";
import { extractPaginatedRows } from "./pagination";
import { ratingColumns, ratingSortOrder } from "./ratingColumns";
import { RECIPE_FILTER_CLAUSES } from "./recipeFilterClauses";
import { recipeTagsColumn } from "./recipeTagsColumn";
import { SqlFilterBuilder } from "./sqlFilterBuilder";

interface RecipeSearchQueryRow extends RecipeSearchRow {
    total_count: number;
}

function buildBaseRecipeSelect(ownerPlaceholder: string): string {
    return `
        SELECT r.id, r.title, r.content, r.language, r.type_id, r.creation_date, r.cooking_time, r.photo_key,
               ${caloriesPerPortion("r")} AS calories_per_portion,
               ${authorColumn("r")},
               ${isOwnerColumn("r", ownerPlaceholder)},
               ${isFavouriteColumn("recipe", "r.id", ownerPlaceholder)},
               ${containsAvoidedColumn("r.id", ownerPlaceholder)},
               ${recipeTagsColumn("r.id", ownerPlaceholder)},
               ${ratingColumns("recipe", "r", ownerPlaceholder)},
               rt.type_name, json_agg(json_build_object('id', i.id, 'name', i.name, 'allergens', i.allergens)) AS ingredients,
               -- cast: COUNT() is bigint, which pg returns as a string, not a number
               COUNT(*) OVER()::int AS total_count
        FROM recipes r
               LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
               LEFT JOIN ingredients i ON ri.ingredient_id = i.id
               LEFT JOIN recipe_types rt ON r.type_id = rt.id
      `;
}

// every branch ends on an id tie-breaker, so OFFSET pages never repeat or skip a row
function buildRecipeOrderBy(sortOrder?: RecipeFilters["sort_order"]): string {
    if (sortOrder === "rating") {
        return ` ORDER BY ${ratingSortOrder("r")}, r.id DESC`;
    }

    if (sortOrder) {
        return ` ORDER BY r.cooking_time ${sortOrder === "asc" ? "ASC" : "DESC"}, r.id DESC`;
    }

    // favourites first, avoided last; both flags are null for a guest, leaving the date order
    return ` ORDER BY "containsAvoided" ASC, "isFavourite" DESC, r.creation_date DESC, r.id DESC`;
}

async function runRecipeSearch(
    pool: Pool,
    builder: SqlFilterBuilder,
    filters: RecipeFilters,
    userId: number | null,
): Promise<PaginatedResult<RecipeSearchRow>> {
    const [ownerPlaceholder] = builder.bindTail(userId);

    for (const clause of RECIPE_FILTER_CLAUSES) {
        if (clause.applies(filters)) {
            clause.apply(builder, filters, { userId });
        }
    }

    let query = `${buildBaseRecipeSelect(ownerPlaceholder)}${builder.whereClause()} GROUP BY r.id, rt.type_name`;

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
    userId: number | null,
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
