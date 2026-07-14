import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "constants/routes";
import { MS_PER_MINUTE } from "constants/time";
import type { LoginRequest } from "types/auth";

import { useLoginMutation } from "redux/services/authApi";

import { isValidEmail } from "utils/authValidation";
import {
    ATTEMPTS_PER_LOCK,
    clearLockout,
    LOCKOUT_LADDER_MINUTES,
    mergeServerRetryAfter,
    readLockout,
    registerFailure,
    writeLockout,
} from "utils/loginLockout";
import {
    getRateLimitSeconds,
    isRateLimitError,
    isServerError,
} from "utils/queryError";

export type LoginMode = "username" | "email";

const EMPTY_FORM: LoginRequest = { login: "", password: "" };
const TICK_INTERVAL_MS = 1000;

// runs `update` only if `login` is still the identifier on screen, guarding against a stale response overwriting a since-changed account's state
function applyIfCurrent(
    currentLoginRef: RefObject<string>,
    login: string,
    update: () => void,
): void {
    if (currentLoginRef.current === login) {
        update();
    }
}

// a failed login shows one generic message, never revealing whether the username or the password was wrong
export const useLoginForm = () => {
    const { t } = useTranslation("auth");
    const navigate = useNavigate();
    const [login] = useLoginMutation();

    const [values, setValues] = useState<LoginRequest>(EMPTY_FORM);
    const [loginMode, setLoginMode] = useState<LoginMode>("username");
    const [error, setError] = useState<string | null>(null);
    const [lockout, setLockout] = useState(() => readLockout(EMPTY_FORM.login));
    const [now, setNow] = useState(() => Date.now());

    const { lockedUntil } = lockout;
    // tracks the identifier actually on screen so a slow response for a since-changed login doesn't clobber it
    const currentLoginRef = useRef(values.login);

    // lockout is scoped per identifier, so switching which account is typed re-reads that account's own state
    useEffect(() => {
        currentLoginRef.current = values.login;
        setLockout(readLockout(values.login));
    }, [values.login]);

    // ticks once a second while locked, both to drive a live countdown and to auto-unlock the moment the lock expires
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

    // switching mode clears the identifier field so a typed username can't be submitted as an email or vice versa
    const setMode = useCallback((mode: LoginMode) => {
        setLoginMode(mode);
        setValues((prev) => ({ ...prev, login: "" }));
        setError(null);
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

        if (loginMode === "email" && !isValidEmail(values.login)) {
            setError(t("errors.email"));

            return;
        }

        // applyIfCurrent guards the visible state, since the field may change before this request resolves
        const submittedLogin = values.login;
        const result = await login({ ...values, login: submittedLogin.trim() });

        if ("data" in result) {
            clearLockout(submittedLogin);
            applyIfCurrent(currentLoginRef, submittedLogin, () => {
                setLockout({
                    failures: 0,
                    lockedUntil: null,
                    lastFailureAt: null,
                });
            });
            void navigate(ROUTES.home);

            return;
        }

        if (isRateLimitError(result.error)) {
            const seconds = getRateLimitSeconds(result.error);
            // counts as a failed attempt too, so the client ladder stays in sync with an early server rejection
            const next = mergeServerRetryAfter(
                registerFailure(lockout),
                seconds,
            );

            writeLockout(next, submittedLogin);
            applyIfCurrent(currentLoginRef, submittedLogin, () => {
                setLockout(next);
                setError(t("errors.tooManyAttempts", { seconds }));
            });

            return;
        }

        if (isServerError(result.error)) {
            applyIfCurrent(currentLoginRef, submittedLogin, () => {
                setError(t("errors.serverError"));
            });
        } else {
            const next = registerFailure(lockout);

            writeLockout(next, submittedLogin);
            applyIfCurrent(currentLoginRef, submittedLogin, () => {
                setLockout(next);
                setError(t("errors.invalidCredentials"));
            });
        }
    }, [isLocked, loginMode, lockout, login, navigate, t, values]);

    return {
        values,
        error,
        setField,
        loginMode,
        setMode,
        handleSubmit,
        isLocked,
        lockoutRemainingMs,
        lockoutTotalMs,
    };
};
