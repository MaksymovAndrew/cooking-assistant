import { z } from "zod";

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

export const menuFiltersSchema = z.object({
    menu_name: optionalStringSchema("Menu name"),
    category_ids: idListStringSchema("Category IDs").optional(),
    limit: limitSchema,
    offset: offsetSchema,
});
