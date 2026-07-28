import { z } from "zod";

import { ALLERGEN_SLUGS, CATEGORY_KEYS, UNIT_KEYS } from "./catalog.types";
import type { CatalogDataEntry } from "./resolveCatalogEntry";

const catalogDataEntrySchema = z.object({
    slug: z.string().min(1),
    category: z.enum(CATEGORY_KEYS),
    nameEn: z.string().min(1),
    nameRu: z.string().min(1).nullable(),
    nameUk: z.string().min(1).nullable(),
    namePl: z.string().min(1).nullable(),
    unit: z.enum(UNIT_KEYS),
    allergens: z.array(z.enum(ALLERGEN_SLUGS)),
    daysToExpire: z.number().positive(),
    seasonality: z.string().min(1),
    storageCondition: z.string().min(1),
    // 0 is a real value for salt, water, stevia, etc. - not a placeholder for "unknown"
    caloriesPerUnit: z.number().min(0).nullable(),
});

// catalogData.json is generated but still committed and read straight into the seed on every deploy, so a shape drift must fail loudly here rather than insert a malformed ingredient row
export function parseCatalogData(raw: unknown): CatalogDataEntry[] {
    const entries = z.array(catalogDataEntrySchema).parse(raw);
    const seenSlugs = new Set<string>();

    for (const entry of entries) {
        if (seenSlugs.has(entry.slug)) {
            throw new Error(`Duplicate catalogData slug: ${entry.slug}`);
        }

        seenSlugs.add(entry.slug);
    }

    return entries;
}
