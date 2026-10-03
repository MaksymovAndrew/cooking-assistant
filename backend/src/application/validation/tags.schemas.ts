import { z } from "zod";

import { TAG_LIMITS } from "constants/tags";

import {
    hasUniqueItems,
    positiveIntegerSchema,
    trimmedStringSchema,
    UNIQUE_ITEMS,
} from "./common.schemas";

const { MAX_NAME_LENGTH, MAX_TAGS_PER_RECIPE } = TAG_LIMITS;

export const tagSchema = z.object({
    name: trimmedStringSchema(MAX_NAME_LENGTH),
});

export const setRecipeTagsSchema = z.object({
    tag_ids: z
        .array(positiveIntegerSchema())
        .max(MAX_TAGS_PER_RECIPE)
        .refine((ids) => hasUniqueItems(ids), UNIQUE_ITEMS),
});
