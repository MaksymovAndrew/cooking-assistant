import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ERROR_CODES } from "constants/errorCodes";
import { ROUTES } from "constants/routes";
import { MS_PER_MINUTE } from "constants/time";

import { useDeleteAccountMutation } from "redux/services/authApi";

import {
    ATTEMPTS_PER_LOCK,
    clearLockout,
    DELETE_ACCOUNT_STORAGE_KEY_PREFIX,
    LOCKOUT_LADDER_MINUTES,
    mergeServerRetryAfter,
    readLockout,
    registerFailure,
    writeLockout,
} from "utils/loginLockout";
import {
    getQueryErrorCode,
    getRateLimitSeconds,
    isRateLimitError,
    isServerError,
} from "utils/queryError";

const TICK_INTERVAL_MS = 1000;

export const useDeleteAccountForm = (login: string) => {
    const { t } = useTranslation("settings");
    const navigate = useNavigate();
    const [deleteAccount] = useDeleteAccountMutation();

    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [lockout, setLockout] = useState(() =>
        readLockout(login, DELETE_ACCOUNT_STORAGE_KEY_PREFIX),
    );
    const [now, setNow] = useState(() => Date.now());

    const { lockedUntil } = lockout;

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

    const isLocked = lockedUntil !== null && now < lockedUntil;
    const lockoutRemainingMs = isLocked ? lockedUntil - now : null;
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

        if (!password) {
            setError(t("deleteAccountModal.errors.passwordRequired"));

            return;
        }

        const result = await deleteAccount({ password });

        if ("data" in result) {
            clearLockout(login, DELETE_ACCOUNT_STORAGE_KEY_PREFIX);
            void navigate(ROUTES.login);

            return;
        }

        if (isRateLimitError(result.error)) {
            const seconds = getRateLimitSeconds(result.error);
            const next = mergeServerRetryAfter(
                registerFailure(lockout),
                seconds,
            );

            writeLockout(next, login, DELETE_ACCOUNT_STORAGE_KEY_PREFIX);
            setLockout(next);
            setError(
                t("deleteAccountModal.errors.tooManyAttempts", { seconds }),
            );

            return;
        }

        if (isServerError(result.error)) {
            setError(t("deleteAccountModal.errors.genericError"));

            return;
        }

        if (
            getQueryErrorCode(result.error) ===
            ERROR_CODES.CURRENT_PASSWORD_INCORRECT
        ) {
            const next = registerFailure(lockout);

            writeLockout(next, login, DELETE_ACCOUNT_STORAGE_KEY_PREFIX);
            setLockout(next);
            setError(t("deleteAccountModal.errors.incorrectPassword"));

            return;
        }

        setError(t("deleteAccountModal.errors.genericError"));
    }, [deleteAccount, isLocked, lockout, login, navigate, password, t]);

    return {
        password,
        setPassword,
        error,
        handleSubmit,
        isLocked,
        lockoutRemainingMs,
        lockoutTotalMs,
    };
};
