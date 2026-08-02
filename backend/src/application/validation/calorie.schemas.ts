import { z } from "zod";

import { numberSchema, positiveIntegerSchema } from "./common.schemas";

const EXACTLY_ONE_SOURCE_MESSAGE =
    "Provide either a recipe or a menu, not both";

export const logIntakeSchema = z
    .object({
        recipe_id: positiveIntegerSchema("Recipe ID").optional(),
        menu_id: positiveIntegerSchema("Menu ID").optional(),
        portions: numberSchema("Portions").positive(
            "Portions must be greater than 0",
        ),
    })
    .refine(
        (data) =>
            (typeof data.recipe_id === "undefined") !==
            (typeof data.menu_id === "undefined"),
        { message: EXACTLY_ONE_SOURCE_MESSAGE, path: ["recipe_id"] },
    );

export const updateCalorieGoalSchema = z.object({
    calorie_goal: positiveIntegerSchema("Calorie goal").nullable(),
    meal_calorie_limit: positiveIntegerSchema("Meal calorie limit").nullable(),
});

export const intakeRangeSchema = z.object({
    from: z.iso.datetime({
        error: (issue) =>
            issue.code === "invalid_type"
                ? "From must be a string"
                : "From must be an ISO datetime",
    }),
    to: z.iso.datetime({
        error: (issue) =>
            issue.code === "invalid_type"
                ? "To must be a string"
                : "To must be an ISO datetime",
    }),
});
