import type { PoolClient } from "pg";

import rawCatalogData from "./catalog/catalogData.json";
import { parseCatalogData } from "./catalog/catalogDataSchema";

interface IngredientSeedRow {
    slug: string;
    name: string;
    unit_id: number;
    category: string;
    allergens: string[];
    days_to_expire: number;
    seasonality: string;
    storage_condition: string;
    calories_per_unit: number | null;
}

// the whole catalog travels as one JSON parameter, so the statement keeps one shape at any size; a row whose
// values match the catalog is left alone, so a deploy rewrites only what the catalog changed
const UPSERT_INGREDIENTS = `
    INSERT INTO ingredients
        (slug, name, id_unit_measurement, category, allergens, days_to_expire, seasonality, storage_condition, calories_per_unit)
    SELECT row.slug, row.name, row.unit_id, row.category,
           ARRAY(SELECT jsonb_array_elements_text(row.allergens)),
           row.days_to_expire, row.seasonality, row.storage_condition, row.calories_per_unit
    FROM jsonb_to_recordset($1::jsonb) AS row(
        slug text, name text, unit_id int, category text, allergens jsonb,
        days_to_expire int, seasonality text, storage_condition text, calories_per_unit float8
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        id_unit_measurement = EXCLUDED.id_unit_measurement,
        category = EXCLUDED.category,
        allergens = EXCLUDED.allergens,
        days_to_expire = EXCLUDED.days_to_expire,
        seasonality = EXCLUDED.seasonality,
        storage_condition = EXCLUDED.storage_condition,
        calories_per_unit = EXCLUDED.calories_per_unit
    WHERE (ingredients.name, ingredients.id_unit_measurement, ingredients.category, ingredients.allergens,
           ingredients.days_to_expire, ingredients.seasonality, ingredients.storage_condition,
           ingredients.calories_per_unit)
        IS DISTINCT FROM (EXCLUDED.name, EXCLUDED.id_unit_measurement, EXCLUDED.category, EXCLUDED.allergens,
           EXCLUDED.days_to_expire, EXCLUDED.seasonality, EXCLUDED.storage_condition,
           EXCLUDED.calories_per_unit)
`;

// re-run on every deploy: ON CONFLICT (slug) DO UPDATE keeps the catalog in sync with catalogData.json instead of only inserting once
export async function seedIngredientsFromCatalog(
    client: PoolClient,
): Promise<number> {
    const catalogData = parseCatalogData(rawCatalogData);
    const unitRows = await client.query<{ id: number; unit_name: string }>(
        `SELECT id, unit_name FROM unit_measurement`,
    );
    const unitIdByName = new Map(
        unitRows.rows.map((row) => [row.unit_name, row.id]),
    );

    const rows: IngredientSeedRow[] = catalogData.map((entry) => {
        const unitId = unitIdByName.get(entry.unit) ?? null;

        if (unitId === null) {
            throw new Error(
                `Unknown unit "${entry.unit}" for ingredient "${entry.slug}"`,
            );
        }

        return {
            slug: entry.slug,
            name: entry.nameEn,
            unit_id: unitId,
            category: entry.category,
            allergens: entry.allergens,
            days_to_expire: entry.daysToExpire,
            seasonality: entry.seasonality,
            storage_condition: entry.storageCondition,
            calories_per_unit: entry.caloriesPerUnit,
        };
    });
    const result = await client.query(UPSERT_INGREDIENTS, [
        JSON.stringify(rows),
    ]);

    return result.rowCount ?? 0;
}
