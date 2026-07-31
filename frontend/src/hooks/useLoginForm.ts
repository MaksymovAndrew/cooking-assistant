import type { RefObject } from "react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "constants/routes";
import type { LoginRequest } from "types/auth";

import { useLoginMutation } from "redux/services/authApi";

import { isValidEmail } from "utils/authValidation";
import {
    clearLockout,
    mergeServerRetryAfter,
    registerFailure,
    writeLockout,
} from "utils/loginLockout";
import {
    getRateLimitSeconds,
    isRateLimitError,
    isServerError,
} from "utils/queryError";

import { useLoginLockout } from "./useLoginLockout";

export type LoginMode = "username" | "email";

const EMPTY_FORM: LoginRequest = { login: "", password: "" };

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

    const {
        lockout,
        setLockout,
        currentLoginRef,
        isLocked,
        lockoutRemainingMs,
        lockoutTotalMs,
    } = useLoginLockout(values.login, () => {
        setError(null);
    });

    const setField = useCallback((field: keyof LoginRequest, value: string) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    }, []);

    // switching mode clears the identifier field so a typed username can't be submitted as an email or vice versa
    const setMode = useCallback((mode: LoginMode) => {
        setLoginMode(mode);
        setValues((prev) => ({ ...prev, login: "" }));
        setError(null);
    }, []);

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
    }, [
        currentLoginRef,
        isLocked,
        loginMode,
        lockout,
        login,
        navigate,
        setLockout,
        t,
        values,
    ]);

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
