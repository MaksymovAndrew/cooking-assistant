import rawCalorieOverrides from "./calorieOverrides.json";
import type {
    AllergenSlug,
    CatalogMapEntry,
    CategoryKey,
    UnitKey,
} from "./catalog.types";
import { caloriesPerUnit, findFdcIdByDescription } from "./nutritionSource";
import {
    parseCalorieOverrides,
    parseTranslationOverrides,
} from "./overridesSchema";
import rawTranslationOverrides from "./translationOverrides.json";
import type { Translation } from "./translationSource";

const calorieOverrides = parseCalorieOverrides(rawCalorieOverrides);
const translationOverrides = parseTranslationOverrides(rawTranslationOverrides);

export interface CatalogDataEntry {
    slug: string;
    category: CategoryKey;
    nameEn: string;
    nameRu: string | null;
    nameUk: string | null;
    namePl: string | null;
    unit: UnitKey;
    allergens: AllergenSlug[];
    daysToExpire: number;
    seasonality: string;
    storageCondition: string;
    caloriesPerUnit: number | null;
}

function resolveCalories(
    item: CatalogMapEntry,
    unitGrams: number | null,
    descriptionByFdcId: Map<string, string>,
    energyByFdcId: Map<string, number>,
): number | null {
    const matchTarget = item.nutritionMatch ?? item.searchName;
    const fdcId = findFdcIdByDescription(matchTarget, descriptionByFdcId);
    const sourceKcalPer100g =
        fdcId === null ? null : (energyByFdcId.get(fdcId) ?? null);
    const kcalPer100g =
        sourceKcalPer100g ?? calorieOverrides[item.slug]?.kcalPer100 ?? null;

    return kcalPer100g === null
        ? null
        : caloriesPerUnit(kcalPer100g, item.unit, unitGrams);
}

interface ResolvedNames {
    nameRu: string | null;
    nameUk: string | null;
    namePl: string | null;
}

function resolveNames(
    item: CatalogMapEntry,
    translations: Map<string, Translation>,
): ResolvedNames {
    const translation = translations.get(item.searchName.toLowerCase());
    const override = translationOverrides[item.slug];

    return {
        nameRu: translation?.ru ?? override?.ru ?? null,
        nameUk: translation?.uk ?? override?.uk ?? null,
        namePl: translation?.pl ?? override?.pl ?? null,
    };
}

export function buildCatalogEntry(
    item: CatalogMapEntry,
    descriptionByFdcId: Map<string, string>,
    energyByFdcId: Map<string, number>,
    translations: Map<string, Translation>,
): CatalogDataEntry {
    const unitGrams = item.unitGrams ?? null;
    const calories = resolveCalories(
        item,
        unitGrams,
        descriptionByFdcId,
        energyByFdcId,
    );
    const names = resolveNames(item, translations);

    return {
        slug: item.slug,
        category: item.category,
        nameEn: item.searchName,
        ...names,
        unit: item.unit,
        allergens: item.allergens,
        daysToExpire: item.daysToExpire,
        seasonality: item.seasonality,
        storageCondition: item.storageCondition,
        caloriesPerUnit: calories,
    };
}
