import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import type { CurrentUser } from "types/auth";

import { useUpdateCalorieGoalMutation } from "redux/services/caloriesApi";

// mirrors the backend's positiveIntegerSchema (calorie.schemas.ts) so a decimal like "2500.5"
// fails client-side with the specific "Enter a valid calorie goal" message, instead of round-tripping
// to the backend and surfacing as the unrelated generic "Something went wrong" error
const parseOptionalPositiveInteger = (value: string): number | null | false => {
    if (value.trim() === "") {
        return null;
    }

    const parsed = Number(value);

    return Number.isInteger(parsed) && parsed > 0 ? parsed : false;
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
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = useCallback(async () => {
        setError(null);

        const parsedGoal = parseOptionalPositiveInteger(goal);

        if (parsedGoal === false) {
            setError(t("dietaryTab.errors.invalidGoal"));

            return;
        }

        const result = await updateCalorieGoal({
            calorie_goal: parsedGoal,
        });

        if ("data" in result) {
            onSuccess();

            return;
        }

        setError(t("dietaryTab.errors.genericError"));
    }, [goal, onSuccess, t, updateCalorieGoal]);

    return {
        goal,
        setGoal,
        error,
        handleSubmit,
    };
};
