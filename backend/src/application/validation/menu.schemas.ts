import { z } from "zod";

import { FIELD_LIMITS } from "constants/fieldLimits";
import type { MenuFilters } from "domain/repositories/menu.filters";

import {
    contentLanguageSchema,
    hasUniqueItems,
    idSchema,
    nonEmptyStringSchema,
    positiveIntegerSchema,
    UNIQUE_ITEMS,
} from "./common.schemas";
import {
    booleanQuerySchema,
    idListStringSchema,
    languageListSchema,
    limitSchema,
    offsetSchema,
} from "./query.schemas";

export const createMenuSchema = z.object({
    menuTitle: nonEmptyStringSchema().max(FIELD_LIMITS.MENU_TITLE_LENGTH),
    menuContent: z.string().optional(),
    language: contentLanguageSchema,
    categoryId: positiveIntegerSchema(),
    personId: idSchema,
    recipeIds: z
        .array(positiveIntegerSchema())
        .max(FIELD_LIMITS.MAX_MENU_RECIPES)
        .refine((ids) => hasUniqueItems(ids), UNIQUE_ITEMS),
});

export const updateMenuSchema = createMenuSchema.omit({
    personId: true,
});

// output shape is checked against the domain's MenuFilters below - the repository interface is typed against that, not against this schema
export const menuFiltersSchema = z.object({
    menu_name: z.string().optional(),
    category_ids: idListStringSchema.optional(),
    favourites: booleanQuerySchema,
    sort_order: z.enum(["rating"]).optional(),
    top_rated: booleanQuerySchema,
    languages: languageListSchema,
    limit: limitSchema,
    offset: offsetSchema,
}) satisfies z.ZodType<MenuFilters>;
