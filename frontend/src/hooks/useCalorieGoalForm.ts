import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import type { CurrentUser } from "types/auth";

import { useUpdateCalorieGoalMutation } from "redux/services/caloriesApi";

const parseOptionalPositiveNumber = (value: string): number | null | false => {
    if (value.trim() === "") {
        return null;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : false;
};

export const useCalorieGoalForm = (
    currentUser: CurrentUser | undefined,
    onSuccess: () => void,
) => {
    const { t } = useTranslation("calories");
    const [updateCalorieGoal] = useUpdateCalorieGoalMutation();

    const [goal, setGoal] = useState(
        currentUser?.calorie_goal?.toString() ?? "",
    );
    const [mealLimit, setMealLimit] = useState(
        currentUser?.meal_calorie_limit?.toString() ?? "",
    );
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = useCallback(async () => {
        setError(null);

        const parsedGoal = parseOptionalPositiveNumber(goal);
        const parsedMealLimit = parseOptionalPositiveNumber(mealLimit);

        if (parsedGoal === false) {
            setError(t("dietaryTab.errors.invalidGoal"));

            return;
        }
        if (parsedMealLimit === false) {
            setError(t("dietaryTab.errors.invalidMealLimit"));

            return;
        }

        const result = await updateCalorieGoal({
            calorie_goal: parsedGoal,
            meal_calorie_limit: parsedMealLimit,
        });

        if ("data" in result) {
            onSuccess();

            return;
        }

        setError(t("dietaryTab.errors.genericError"));
    }, [goal, mealLimit, onSuccess, t, updateCalorieGoal]);

    return {
        goal,
        setGoal,
        mealLimit,
        setMealLimit,
        error,
        handleSubmit,
    };
};
