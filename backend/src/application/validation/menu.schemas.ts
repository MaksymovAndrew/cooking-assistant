import { z } from "zod";

import type { MenuFilters } from "domain/repositories/menu.filters";

import {
    hasUniqueItems,
    idListStringSchema,
    idSchema,
    limitSchema,
    nonEmptyStringSchema,
    offsetSchema,
    optionalStringSchema,
    positiveIntegerSchema,
    requiredOrInvalidType,
} from "./common.schemas";

const recipeIdSchema = positiveIntegerSchema("Recipe ID");

export const createMenuSchema = z.object({
    menuTitle: nonEmptyStringSchema("Menu title"),
    menuContent: optionalStringSchema("Menu content"),
    categoryId: positiveIntegerSchema("Category ID"),
    personId: idSchema,
    recipeIds: z
        .array(recipeIdSchema, {
            error: requiredOrInvalidType(
                "Recipe IDs are required",
                "Recipe IDs must be an array",
            ),
        })
        .max(500, { message: "Menu cannot contain more than 500 recipes" })
        .refine((ids) => hasUniqueItems(ids), {
            message: "Recipe IDs must be unique",
        }),
});

export const updateMenuSchema = createMenuSchema.omit({
    personId: true,
});

// output shape is checked against the domain's MenuFilters below - the repository interface is typed against that, not against this schema
export const menuFiltersSchema = z.object({
    menu_name: optionalStringSchema("Menu name"),
    category_ids: idListStringSchema("Category IDs").optional(),
    limit: limitSchema,
    offset: offsetSchema,
}) satisfies z.ZodType<MenuFilters>;
