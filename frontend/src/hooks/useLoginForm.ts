import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "constants/routes";
import { MS_PER_MINUTE } from "constants/time";
import type { LoginRequest } from "types/auth";

import { useLoginMutation } from "redux/services/authApi";

import {
    ATTEMPTS_PER_LOCK,
    clearLockout,
    LOCKOUT_LADDER_MINUTES,
    mergeServerRetryAfter,
    readLockout,
    registerFailure,
    writeLockout,
} from "utils/loginLockout";
import { getQueryErrorRetryAfter, getQueryErrorStatus } from "utils/queryError";

const EMPTY_FORM: LoginRequest = { login: "", password: "" };
const TOO_MANY_ATTEMPTS_STATUS = 429;
const SERVER_ERROR_STATUS_THRESHOLD = 500;
// used only when the server did not send a Retry-After header
const FALLBACK_LOCKOUT_SECONDS = 60;
const TICK_INTERVAL_MS = 1000;

// a failed login shows one generic message, never revealing whether the username or the password was wrong
export const useLoginForm = () => {
    const { t } = useTranslation("auth");
    const navigate = useNavigate();
    const [login] = useLoginMutation();

    const [values, setValues] = useState<LoginRequest>(EMPTY_FORM);
    const [error, setError] = useState<string | null>(null);
    const [lockout, setLockout] = useState(() => readLockout());
    const [now, setNow] = useState(() => Date.now());

    const { lockedUntil } = lockout;

    // ticks once a second while locked, both to drive a live countdown and to
    // auto-unlock the moment the lock expires
    useEffect(() => {
        if (lockedUntil === null) {
            return undefined;
        }

        const tick = () => {
            const currentNow = Date.now();

            setNow(currentNow);

            if (currentNow >= lockedUntil) {
                setLockout((prev) => ({ ...prev, lockedUntil: null }));
                setError(null);
            }
        };

        tick();
        const interval = setInterval(tick, TICK_INTERVAL_MS);

        return () => {
            clearInterval(interval);
        };
    }, [lockedUntil]);

    const setField = useCallback((field: keyof LoginRequest, value: string) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    }, []);

    const isLocked = lockedUntil !== null && now < lockedUntil;
    const lockoutRemainingMs = isLocked ? lockedUntil - now : null;
    // derived from the same ladder registerFailure climbs, purely for the countdown progress bar
    const lockoutTotalMs =
        isLocked && lockout.failures >= ATTEMPTS_PER_LOCK
            ? LOCKOUT_LADDER_MINUTES[
                  Math.min(
                      Math.floor(lockout.failures / ATTEMPTS_PER_LOCK) - 1,
                      LOCKOUT_LADDER_MINUTES.length - 1,
                  )
              ] * MS_PER_MINUTE
            : null;

    const handleSubmit = useCallback(async () => {
        if (isLocked) return;

        setError(null);

        if (!values.login || !values.password) {
            setError(t("errors.allFieldsRequired"));

            return;
        }

        const result = await login(values);

        if ("data" in result) {
            clearLockout();
            setLockout({ failures: 0, lockedUntil: null });
            void navigate(ROUTES.home);

            return;
        }

        const status = getQueryErrorStatus(result.error);

        if (status === TOO_MANY_ATTEMPTS_STATUS) {
            const seconds =
                getQueryErrorRetryAfter(result.error) ??
                FALLBACK_LOCKOUT_SECONDS;
            const next = mergeServerRetryAfter(lockout, seconds);

            writeLockout(next);
            setLockout(next);
            setError(t("errors.tooManyAttempts", { seconds }));
        } else if (status !== null && status >= SERVER_ERROR_STATUS_THRESHOLD) {
            setError(t("errors.serverError"));
        } else {
            const next = registerFailure(lockout);

            writeLockout(next);
            setLockout(next);
            setError(t("errors.invalidCredentials"));
        }
    }, [isLocked, lockout, login, navigate, t, values]);

    return {
        values,
        error,
        setField,
        handleSubmit,
        isLocked,
        lockoutRemainingMs,
        lockoutTotalMs,
    };
};
