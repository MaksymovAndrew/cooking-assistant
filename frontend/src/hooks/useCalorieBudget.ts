import { useMemo } from "react";

import { useAppSelector } from "redux/hooks";
import { selectIsAuthed } from "redux/selectors/sessionSelectors";
import { useGetMeQuery } from "redux/services/authApi";
import { useGetCalorieIntakeQuery } from "redux/services/caloriesApi";

import { useTodayDateKey } from "hooks/useTodayDateKey";

import { getTodayRange } from "utils/calorieDateRange";
import { computeCalorieSummary } from "utils/computeCalorieSummary";

// skipped until authed: a 401 during the session check would trip the global auth redirect
export const useCalorieBudget = () => {
    const isAuthed = useAppSelector(selectIsAuthed);
    const { data: currentUser } = useGetMeQuery(null);
    const todayKey = useTodayDateKey();
    const range = useMemo(() => getTodayRange(todayKey), [todayKey]);
    const { data: entries = [], isLoading } = useGetCalorieIntakeQuery(range, {
        skip: !isAuthed,
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
