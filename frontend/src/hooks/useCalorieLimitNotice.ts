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

interface UseCalorieLimitNoticeOptions {
    // "not yet", not "used up": the notice can still fire later on a route that doesn't skip it
    skip?: boolean;
}

// once per user and calendar day, kept in localStorage so a reload doesn't show it again
export const useCalorieLimitNotice = ({
    skip: skipOption = false,
}: UseCalorieLimitNoticeOptions = {}): void => {
    const dispatch = useAppDispatch();
    const isChecking = useAppSelector(selectIsChecking);
    const isAuthed = useAppSelector(selectIsAuthed);
    const skip = skipOption || isChecking || !isAuthed;
    const { data: currentUser } = useGetMeQuery(null, { skip });
    const todayKey = useTodayDateKey();
    const range = useMemo(() => getTodayRange(todayKey), [todayKey]);
    const { data: entries = [] } = useGetCalorieIntakeQuery(range, { skip });
    const goal = currentUser?.calorie_goal ?? null;
    const summary = computeCalorieSummary(entries, goal);
    const activeModal = useAppSelector(selectActiveModal);
    // a day, not a boolean, so a tab left open past midnight re-arms for the new day
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

    // marked when shown, not when queued, or a notice waiting behind another modal is never seen
    useEffect(() => {
        const pending = enqueued.current;

        if (pending === null || activeModal?.id !== pending.id) {
            return;
        }

        enqueued.current = null;
        markCalorieLimitNoticeShown(pending.userId, pending.day);
    }, [activeModal]);
};
