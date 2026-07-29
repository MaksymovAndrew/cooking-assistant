import { z } from "zod";

import {
    ALLERGEN_SLUGS,
    type CatalogMapEntry,
    CATEGORY_KEYS,
    COUNTED_UNIT_KEYS,
    UNIT_KEYS,
    type UnitKey,
} from "./catalog.types";

const isCountedUnit = (unit: UnitKey): boolean =>
    (COUNTED_UNIT_KEYS as readonly UnitKey[]).includes(unit);

const catalogMapEntrySchema = z
    .object({
        slug: z.string().min(1),
        category: z.enum(CATEGORY_KEYS),
        searchName: z.string().min(1),
        nutritionMatch: z.string().min(1).optional(),
        unit: z.enum(UNIT_KEYS),
        unitGrams: z.number().positive().optional(),
        allergens: z.array(z.enum(ALLERGEN_SLUGS)),
        daysToExpire: z.number().positive(),
        seasonality: z.string().min(1),
        storageCondition: z.string().min(1),
    })
    .superRefine((entry, ctx) => {
        if (isCountedUnit(entry.unit) && (entry.unitGrams ?? null) === null) {
            ctx.addIssue(
                `${entry.slug}: counted unit "${entry.unit}" requires unitGrams`,
            );
        }
    });

// validates the raw JSON at build time - a bad category/unit/allergen slug or a missing unitGrams on a counted unit fails loudly here instead of silently producing bad catalog data
export function parseCatalogMap(raw: unknown): CatalogMapEntry[] {
    const entries = z.array(catalogMapEntrySchema).parse(raw);
    const seenSlugs = new Set<string>();

    for (const entry of entries) {
        if (seenSlugs.has(entry.slug)) {
            throw new Error(`Duplicate catalogMap slug: ${entry.slug}`);
        }
        seenSlugs.add(entry.slug);
    }

    return entries;
}
