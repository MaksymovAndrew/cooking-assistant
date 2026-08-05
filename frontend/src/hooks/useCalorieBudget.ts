import { useMemo } from "react";

import { useAppSelector } from "redux/hooks";
import { selectIsGuest } from "redux/selectors/viewerSelectors";
import { useGetMeQuery } from "redux/services/authApi";
import { useGetCalorieIntakeQuery } from "redux/services/caloriesApi";

import { useTodayDateKey } from "hooks/useTodayDateKey";

import { getTodayRange } from "utils/calorieDateRange";
import { computeCalorieSummary } from "utils/computeCalorieSummary";

// safe to call from any component regardless of who's browsing: a guest gets an empty budget
// instead of a 401 on /api/calorie-intake, which would otherwise trip the global auth redirect
export const useCalorieBudget = () => {
    const isGuest = useAppSelector(selectIsGuest);
    const { data: currentUser } = useGetMeQuery(null);
    const todayKey = useTodayDateKey();
    const range = useMemo(() => getTodayRange(todayKey), [todayKey]);
    const { data: entries = [], isLoading } = useGetCalorieIntakeQuery(range, {
        skip: isGuest,
    });

    const goal = currentUser?.calorie_goal ?? null;
    const summary = useMemo(
        () => computeCalorieSummary(entries, goal),
        [entries, goal],
    );

    return {
        entries,
        goal,
        isLoading,
        ...summary,
    };
};
