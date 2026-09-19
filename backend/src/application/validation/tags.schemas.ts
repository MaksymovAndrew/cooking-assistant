import { z } from "zod";

import { TAG_LIMITS } from "constants/tags";

import {
    hasUniqueItems,
    positiveIntegerSchema,
    trimmedStringSchema,
} from "./common.schemas";

const { MAX_NAME_LENGTH, MAX_TAGS_PER_RECIPE } = TAG_LIMITS;

const tagNameSchema = trimmedStringSchema("Name").pipe(
    z
        .string()
        .max(
            MAX_NAME_LENGTH,
            `Name must be at most ${MAX_NAME_LENGTH} characters`,
        ),
);

export const createTagSchema = z.object({ name: tagNameSchema });

export const renameTagSchema = z.object({ name: tagNameSchema });

export const setRecipeTagsSchema = z.object({
    tag_ids: z
        .array(positiveIntegerSchema("Tag ID"), {
            error: "Incorrect data format",
        })
        .max(
            MAX_TAGS_PER_RECIPE,
            `Tag IDs must contain at most ${MAX_TAGS_PER_RECIPE} items`,
        )
        .refine((ids) => hasUniqueItems(ids), {
            message: "Tag IDs must be unique",
        }),
});
