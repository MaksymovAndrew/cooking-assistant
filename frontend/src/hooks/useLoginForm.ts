import type { RefObject } from "react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";
import type { LoginRequest } from "types/auth";

import { useLoginMutation } from "redux/services/authApi";

import { useAppRouter } from "hooks/useAppRouter";

import { isValidEmail } from "utils/authValidation";
import { resolveLoginFailure } from "utils/loginFailure";
import { clearLockout, writeLockout } from "utils/loginLockout";
import { takeLoginRedirect } from "utils/loginRedirect";

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
    const router = useAppRouter();
    const [login, { isLoading: isSubmitting }] = useLoginMutation();

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
            // return the user to the page they were trying to reach (e.g. a private route, or a
            // guest-only "Log in" CTA) instead of always dropping them on the home dashboard
            router.replace(takeLoginRedirect() ?? ROUTES.home);

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
        isLocked,
        loginMode,
        lockout,
        login,
        router,
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
