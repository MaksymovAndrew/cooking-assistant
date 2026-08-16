import { useEffect, useRef } from "react";

import { useAppDispatch } from "redux/hooks";
import { closeModal, MODAL_TYPE, openModal } from "redux/slices/uiSlice";

import { useOnlineStatus } from "hooks/useOnlineStatus";

// enqueues the offline modal while offline and withdraws it on reconnect; the effect only runs
// when connectivity flips, so dismissing it stays quiet until the next drop
export const useOfflineNotice = (): void => {
    const dispatch = useAppDispatch();
    const isOnline = useOnlineStatus();
    const openedId = useRef<string | null>(null);

    useEffect(() => {
        if (!isOnline) {
            // guarded so a re-run can't overwrite the id with one the queue deduped away
            openedId.current ??= dispatch(
                openModal({ type: MODAL_TYPE.offline }),
            ).payload.id;

            return;
        }

        if (openedId.current !== null) {
            dispatch(closeModal(openedId.current));
            openedId.current = null;
        }
    }, [isOnline, dispatch]);
};
