import { readFileSync } from "fs";
import { join } from "path";

import { UNIT_COEFFICIENTS, type UnitKey } from "./catalog.types";
import { parseCsv } from "./csvParser";

const ENERGY_NUTRIENT_NAME = "Energy";
const ENERGY_NUTRIENT_UNIT = "KCAL";

export function loadEnergyByFdcId(foodCsvDir: string): Map<string, number> {
    const nutrients = parseCsv(
        readFileSync(join(foodCsvDir, "nutrient.csv"), "utf8"),
    );
    const energyNutrient = nutrients.find(
        (row) =>
            row.name === ENERGY_NUTRIENT_NAME &&
            row.unit_name === ENERGY_NUTRIENT_UNIT,
    );

    if (!energyNutrient) {
        throw new Error(
            `Could not find a "${ENERGY_NUTRIENT_NAME}" nutrient in ${ENERGY_NUTRIENT_UNIT} - dataset format may have changed`,
        );
    }

    const energyNutrientId = energyNutrient.id;
    const foodNutrients = parseCsv(
        readFileSync(join(foodCsvDir, "food_nutrient.csv"), "utf8"),
    );
    const energyByFdcId = new Map<string, number>();

    for (const row of foodNutrients) {
        if (row.nutrient_id === energyNutrientId && row.amount) {
            energyByFdcId.set(row.fdc_id, Number(row.amount));
        }
    }

    return energyByFdcId;
}

export function loadFoodDescriptions(foodCsvDir: string): Map<string, string> {
    const foods = parseCsv(readFileSync(join(foodCsvDir, "food.csv"), "utf8"));
    const descriptionByFdcId = new Map<string, string>();

    for (const row of foods) {
        descriptionByFdcId.set(row.fdc_id, row.description);
    }

    return descriptionByFdcId;
}

export function findFdcIdByDescription(
    target: string,
    descriptionByFdcId: Map<string, string>,
): string | null {
    const normalizedTarget = target.trim().toLowerCase();
    let bestMatch: { fdcId: string; length: number } | null = null;

    for (const [fdcId, description] of descriptionByFdcId) {
        const normalizedDescription = description.toLowerCase();

        if (normalizedDescription === normalizedTarget) {
            return fdcId;
        }

        const startsWithTarget =
            normalizedDescription.startsWith(normalizedTarget);
        const isShorterThanBestMatch =
            bestMatch === null || description.length < bestMatch.length;

        if (startsWithTarget && isShorterThanBestMatch) {
            bestMatch = { fdcId, length: description.length };
        }
    }

    return bestMatch === null ? null : bestMatch.fdcId;
}

function round2(value: number): number {
    return Math.round(value * 100) / 100;
}

// ккал/100г → ккал на один юнит ингредиента
export function caloriesPerUnit(
    kcalPer100g: number,
    unit: UnitKey,
    unitGrams: number | null,
): number | null {
    const coefficient = UNIT_COEFFICIENTS[unit] ?? null;

    if (coefficient !== null) {
        return round2((kcalPer100g * coefficient) / 100);
    }

    if (unitGrams !== null) {
        return round2((kcalPer100g * unitGrams) / 100);
    }

    return null;
}
