import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import type { LoginRequest } from "types/auth";

import { useLoginMutation } from "redux/services/authApi";

import { resolveLoginFailure } from "utils/loginFailure";
import {
    applyIfCurrent,
    loginInputErrorKey,
    type LoginMode,
} from "utils/loginForm";
import { clearLockout, EMPTY_LOCKOUT, writeLockout } from "utils/loginLockout";

import { useFinishLogin } from "./useFinishLogin";
import { useLoginLockout } from "./useLoginLockout";

const EMPTY_FORM: LoginRequest = { login: "", password: "" };

// a failed login shows one generic message, never revealing whether the username or the password was wrong
export const useLoginForm = () => {
    const { t } = useTranslation("auth");
    const [login, { isLoading: isSubmitting }] = useLoginMutation();
    const finishLogin = useFinishLogin();

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

        const inputErrorKey = loginInputErrorKey(values, loginMode);

        if (inputErrorKey !== null) {
            setError(t(inputErrorKey));

            return;
        }

        // applyIfCurrent guards the visible state, since the field may change before this request resolves
        const submittedLogin = values.login;
        const result = await login({ ...values, login: submittedLogin.trim() });

        if ("data" in result) {
            clearLockout(submittedLogin);
            applyIfCurrent(currentLoginRef, submittedLogin, () => {
                setLockout(EMPTY_LOCKOUT);
            });
            await finishLogin();

            return;
        }

        const { next, errorKey, seconds } = resolveLoginFailure(
            result.error,
            lockout,
        );

        if (next !== null) {
            writeLockout(next, submittedLogin);
        }

        applyIfCurrent(currentLoginRef, submittedLogin, () => {
            if (next !== null) {
                setLockout(next);
            }

            setError(t(errorKey, { seconds }));
        });
    }, [
        currentLoginRef,
        finishLogin,
        isLocked,
        loginMode,
        lockout,
        login,
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
        isSubmitting,
        lockoutRemainingMs,
        lockoutTotalMs,
    };
};
