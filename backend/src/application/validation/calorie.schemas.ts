import { z } from "zod";

import { VALIDATION_MESSAGES } from "constants/validationMessages";
import type { RecordSource } from "domain/repositories/recordSource";

import { positiveIntegerSchema } from "./common.schemas";

export const sourceIdFields = {
    recipe_id: positiveIntegerSchema().optional(),
    menu_id: positiveIntegerSchema().optional(),
};

interface SourceIds {
    recipe_id?: number;
    menu_id?: number;
}

// names the one source, so a use case never meets the "both" or "neither" case zod already ruled out
export function singleSource(
    { recipe_id, menu_id }: SourceIds,
    ctx: z.RefinementCtx,
): RecordSource {
    if (typeof menu_id === "undefined" && typeof recipe_id === "number") {
        return { recipeId: recipe_id };
    }

    if (typeof recipe_id === "undefined" && typeof menu_id === "number") {
        return { menuId: menu_id };
    }

    ctx.addIssue({
        code: "custom",
        message: VALIDATION_MESSAGES.EXACTLY_ONE_SOURCE,
        path: ["recipe_id"],
    });

    return z.NEVER;
}

export const logIntakeSchema = z
    .object({ ...sourceIdFields, portions: z.number().positive() })
    .transform(({ portions, ...ids }, ctx) => ({
        source: singleSource(ids, ctx),
        portions,
    }));

export const updateCalorieGoalSchema = z.object({
    calorie_goal: positiveIntegerSchema().nullable(),
});

export const intakeRangeSchema = z.object({
    from: z.iso.datetime(),
    to: z.iso.datetime(),
});
