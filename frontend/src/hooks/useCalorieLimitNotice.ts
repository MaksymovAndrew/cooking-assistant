import { useEffect, useMemo, useRef } from "react";

import { useAppDispatch, useAppSelector } from "redux/hooks";
import {
    selectIsAuthed,
    selectIsChecking,
} from "redux/selectors/sessionSelectors";
import { selectActiveModal } from "redux/selectors/uiSelectors";
import { useGetMeQuery } from "redux/services/authApi";
import { useGetCalorieIntakeQuery } from "redux/services/caloriesApi";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

import { useTodayDateKey } from "hooks/useTodayDateKey";

import { getTodayRange } from "utils/calorieDateRange";
import {
    hasShownCalorieLimitNotice,
    markCalorieLimitNoticeShown,
} from "utils/calorieLimitNoticeStorage";
import { computeCalorieSummary } from "utils/computeCalorieSummary";

// once per (user, calendar day): opens the shared modal the first time today's intake crosses
// the goal, persisted in localStorage so it survives reloads/restarts, not just this tab session
export const useCalorieLimitNotice = (): void => {
    const dispatch = useAppDispatch();
    const isChecking = useAppSelector(selectIsChecking);
    const isAuthed = useAppSelector(selectIsAuthed);
    const skip = isChecking || !isAuthed;
    const { data: currentUser } = useGetMeQuery(null, { skip });
    const todayKey = useTodayDateKey();
    const range = useMemo(() => getTodayRange(todayKey), [todayKey]);
    const { data: entries = [] } = useGetCalorieIntakeQuery(range, { skip });
    const goal = currentUser?.calorie_goal ?? null;
    const summary = computeCalorieSummary(entries, goal);
    const activeModal = useAppSelector(selectActiveModal);
    // stores the day it last fired for, not just a boolean - so a tab left open across midnight
    // re-arms for the new day instead of staying silenced by yesterday's firing
    const firedForDay = useRef<string | null>(null);
    const enqueued = useRef<{ id: string; userId: number; day: string } | null>(
        null,
    );

    useEffect(() => {
        const notReady = skip || !currentUser || goal === null;

        if (notReady || firedForDay.current === todayKey) {
            return;
        }

        if (hasShownCalorieLimitNotice(currentUser.id, todayKey)) {
            firedForDay.current = todayKey;

            return;
        }

        if (!summary.isOverLimit) {
            return;
        }

        firedForDay.current = todayKey;
        enqueued.current = {
            id: dispatch(
                openModal({
                    type: MODAL_TYPE.calorieLimit,
                    consumed: summary.consumed,
                    goal,
                }),
            ).payload.id,
            userId: currentUser.id,
            day: todayKey,
        };
    }, [
        skip,
        currentUser,
        goal,
        todayKey,
        summary.isOverLimit,
        summary.consumed,
        dispatch,
    ]);

    // marks on presentation, not on enqueue - a notice still waiting behind another modal
    // would otherwise be silenced for the whole day before it was ever seen
    useEffect(() => {
        const pending = enqueued.current;

        if (pending === null || activeModal?.id !== pending.id) {
            return;
        }

        enqueued.current = null;
        markCalorieLimitNoticeShown(pending.userId, pending.day);
    }, [activeModal]);
};
