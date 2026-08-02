import { useMemo } from "react";

import { useGetMeQuery } from "redux/services/authApi";
import { useGetCalorieIntakeQuery } from "redux/services/caloriesApi";

import { getTodayRange } from "utils/calorieDateRange";
import { computeCalorieSummary } from "utils/computeCalorieSummary";

export const useCalorieBudget = () => {
    const { data: currentUser } = useGetMeQuery(null);
    const range = useMemo(() => getTodayRange(), []);
    const { data: entries = [], isLoading } = useGetCalorieIntakeQuery(range);

    const goal = currentUser?.calorie_goal ?? null;
    const summary = useMemo(
        () => computeCalorieSummary(entries, goal),
        [entries, goal],
    );

    return {
        entries,
        goal,
        mealLimit: currentUser?.meal_calorie_limit ?? null,
        isLoading,
        ...summary,
    };
};
