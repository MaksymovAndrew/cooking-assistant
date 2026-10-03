import { useCallback, useEffect } from "react";

import { MS_PER_MINUTE } from "constants/time";

import { useAppDispatch, useAppSelector } from "redux/hooks";
import { selectResendCooldownUntil } from "redux/selectors/emailVerificationSelectors";
import { useRequestEmailVerificationMutation } from "redux/services/accountSecurityApi";
import {
    resendCooldownExpired,
    resendCooldownStarted,
} from "redux/slices/emailVerificationSlice";

const RESEND_COOLDOWN_MS = MS_PER_MINUTE;

// a client throttle on top of the server's rate limit, in redux so navigating doesn't reset it
export const useResendVerificationCooldown = () => {
    const dispatch = useAppDispatch();
    const [requestEmailVerification] = useRequestEmailVerificationMutation();
    const cooldownUntil = useAppSelector(selectResendCooldownUntil);
    const isOnCooldown = cooldownUntil !== null;

    // re-armed from the stored cooldown on mount; one already in the past expires at once
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
