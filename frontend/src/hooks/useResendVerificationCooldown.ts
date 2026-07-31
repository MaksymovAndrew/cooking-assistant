import { useCallback, useEffect } from "react";

import { MS_PER_MINUTE } from "constants/time";

import { useAppDispatch, useAppSelector } from "redux/hooks";
import { selectResendCooldownUntil } from "redux/selectors/emailVerificationSelectors";
import { useRequestEmailVerificationMutation } from "redux/services/authApi";
import {
    resendCooldownExpired,
    resendCooldownStarted,
} from "redux/slices/emailVerificationSlice";

const RESEND_COOLDOWN_MS = MS_PER_MINUTE;

// client-side throttle on top of the server's own rate limit, so a rapid click doesn't fire off several emails before the 429 kicks in; kept in redux so the cooldown is shared across every page (Home banner, Settings), not reset by navigating between them
export const useResendVerificationCooldown = () => {
    const dispatch = useAppDispatch();
    const [requestEmailVerification] = useRequestEmailVerificationMutation();
    const cooldownUntil = useAppSelector(selectResendCooldownUntil);
    const isOnCooldown = cooldownUntil !== null;

    // re-arms the auto-clear against whatever cooldown is already in the store, so mounting mid-cooldown (e.g. after navigating pages) still ends it on time - also self-corrects a stale cooldownUntil already in the past (immediately dispatches expiry instead of waiting out a negative timeout)
    useEffect(() => {
        if (cooldownUntil === null) {
            return undefined;
        }

        const remainingMs = cooldownUntil - Date.now();

        if (remainingMs <= 0) {
            dispatch(resendCooldownExpired());

            return undefined;
        }

        const timer = setTimeout(() => {
            dispatch(resendCooldownExpired());
        }, remainingMs);

        return () => {
            clearTimeout(timer);
        };
    }, [cooldownUntil, dispatch]);

    const send = useCallback(() => {
        requestEmailVerification(null).catch(() => undefined);
        dispatch(resendCooldownStarted(Date.now() + RESEND_COOLDOWN_MS));
    }, [dispatch, requestEmailVerification]);

    return { send, isOnCooldown };
};
