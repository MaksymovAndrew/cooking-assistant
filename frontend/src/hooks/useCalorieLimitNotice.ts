import { useEffect, useMemo, useRef } from "react";

import { useAppDispatch, useAppSelector } from "redux/hooks";
import {
    selectIsAuthed,
    selectIsChecking,
} from "redux/selectors/sessionSelectors";
import { useGetMeQuery } from "redux/services/authApi";
import { useGetCalorieIntakeQuery } from "redux/services/caloriesApi";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

import { getTodayRange } from "utils/calorieDateRange";
import {
    hasShownCalorieLimitNotice,
    markCalorieLimitNoticeShown,
} from "utils/calorieLimitNoticeStorage";
import { computeCalorieSummary } from "utils/computeCalorieSummary";

// one-shot per tab session: opens the shared modal the first time today's intake crosses the goal
export const useCalorieLimitNotice = (): void => {
    const dispatch = useAppDispatch();
    const isChecking = useAppSelector(selectIsChecking);
    const isAuthed = useAppSelector(selectIsAuthed);
    const skip = isChecking || !isAuthed;
    const { data: currentUser } = useGetMeQuery(null, { skip });
    const range = useMemo(() => getTodayRange(), []);
    const { data: entries = [] } = useGetCalorieIntakeQuery(range, { skip });
    const goal = currentUser?.calorie_goal ?? null;
    const summary = computeCalorieSummary(entries, goal);
    const hasFired = useRef(false);

    useEffect(() => {
        const notReady = skip || goal === null;

        if (notReady || hasFired.current) {
            return;
        }

        if (hasShownCalorieLimitNotice()) {
            hasFired.current = true;

            return;
        }

        if (!summary.isOverLimit) {
            return;
        }

        hasFired.current = true;
        markCalorieLimitNoticeShown();
        dispatch(
            openModal({
                type: MODAL_TYPE.calorieLimit,
                consumed: summary.consumed,
                goal,
            }),
        );
    }, [skip, goal, summary.isOverLimit, summary.consumed, dispatch]);
};
