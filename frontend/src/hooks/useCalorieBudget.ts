import { useMemo } from "react";

import { useAppSelector } from "redux/hooks";
import { selectIsAuthed } from "redux/selectors/sessionSelectors";
import { useGetMeQuery } from "redux/services/authApi";
import { useGetCalorieIntakeQuery } from "redux/services/caloriesApi";

import { useTodayDateKey } from "hooks/useTodayDateKey";

import { getTodayRange } from "utils/calorieDateRange";
import { computeCalorieSummary } from "utils/computeCalorieSummary";

// safe to call from any component regardless of who's browsing: skipped until the session is
// confirmed authed (not just "not yet known to be a guest"), so it never fires a 401 on
// /api/calorie-intake during the initial checking window either - that 401 would otherwise trip
// the global auth redirect
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
