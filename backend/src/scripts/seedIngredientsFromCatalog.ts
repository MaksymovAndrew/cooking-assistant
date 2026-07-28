import type { Pool } from "pg";

import rawCatalogData from "./catalog/catalogData.json";
import { parseCatalogData } from "./catalog/catalogDataSchema";

const INGREDIENT_BATCH_SIZE = 100;
const COLUMNS_PER_ROW = 9;

interface IngredientInsertRow {
    slug: string;
    name: string;
    unitId: number;
    category: string;
    allergens: string[];
    daysToExpire: number;
    seasonality: string;
    storageCondition: string;
    caloriesPerUnit: number | null;
}

function chunk<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = [];

    for (let start = 0; start < items.length; start += size) {
        chunks.push(items.slice(start, start + size));
    }

    return chunks;
}

async function insertIngredientBatch(
    pool: Pool,
    batch: IngredientInsertRow[],
): Promise<number> {
    const values: string[] = [];
    const params: (string | number | string[] | null)[] = [];

    batch.forEach((row, index) => {
        const base = index * COLUMNS_PER_ROW;

        values.push(
            `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}::text[], $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9})`,
        );
        params.push(
            row.slug,
            row.name,
            row.unitId,
            row.category,
            row.allergens,
            row.daysToExpire,
            row.seasonality,
            row.storageCondition,
            row.caloriesPerUnit,
        );
    });

    const result = await pool.query(
        `INSERT INTO ingredients
             (slug, name, id_unit_measurement, category, allergens, days_to_expire, seasonality, storage_condition, calories_per_unit)
         VALUES ${values.join(", ")}
         ON CONFLICT (slug) DO UPDATE SET
             name = EXCLUDED.name,
             id_unit_measurement = EXCLUDED.id_unit_measurement,
             category = EXCLUDED.category,
             allergens = EXCLUDED.allergens,
             days_to_expire = EXCLUDED.days_to_expire,
             seasonality = EXCLUDED.seasonality,
             storage_condition = EXCLUDED.storage_condition,
             calories_per_unit = EXCLUDED.calories_per_unit`,
        params,
    );

    return result.rowCount ?? 0;
}

// re-run on every deploy: ON CONFLICT (slug) DO UPDATE keeps the catalog in sync with catalogData.json instead of only inserting once
export async function seedIngredientsFromCatalog(pool: Pool): Promise<number> {
    const catalogData = parseCatalogData(rawCatalogData);
    const unitRows = await pool.query<{ id: number; unit_name: string }>(
        `SELECT id, unit_name FROM unit_measurement`,
    );
    const unitIdByName = new Map(
        unitRows.rows.map((row) => [row.unit_name, row.id]),
    );

    const rows: IngredientInsertRow[] = catalogData.map((entry) => {
        const unitId = unitIdByName.get(entry.unit) ?? null;

        if (unitId === null) {
            throw new Error(
                `Unknown unit "${entry.unit}" for ingredient "${entry.slug}"`,
            );
        }

        return {
            slug: entry.slug,
            name: entry.nameEn,
            unitId,
            category: entry.category,
            allergens: entry.allergens,
            daysToExpire: entry.daysToExpire,
            seasonality: entry.seasonality,
            storageCondition: entry.storageCondition,
            caloriesPerUnit: entry.caloriesPerUnit,
        };
    });

    let affected = 0;

    for (const batch of chunk(rows, INGREDIENT_BATCH_SIZE)) {
        affected += await insertIngredientBatch(pool, batch);
    }

    return affected;
}
