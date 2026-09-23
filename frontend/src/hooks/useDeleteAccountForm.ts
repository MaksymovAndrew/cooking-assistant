import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { useDeleteAccountMutation } from "redux/services/authApi";

import { useAppRouter } from "hooks/useAppRouter";
import { useLockoutCountdown } from "hooks/useLockoutCountdown";

import { resolveDeleteAccountFailure } from "utils/deleteAccountFailure";
import {
    clearLockout,
    DELETE_ACCOUNT_STORAGE_KEY_PREFIX,
    readLockout,
    writeLockout,
} from "utils/loginLockout";

export const useDeleteAccountForm = (login: string) => {
    const { t } = useTranslation("settings");
    const router = useAppRouter();
    const [deleteAccount, { isLoading: isSubmitting }] =
        useDeleteAccountMutation();

    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [lockout, setLockout] = useState(() =>
        readLockout(login, DELETE_ACCOUNT_STORAGE_KEY_PREFIX),
    );
    const { isLocked, lockoutRemainingMs, lockoutTotalMs } =
        useLockoutCountdown(lockout, setLockout, () => {
            setError(null);
        });

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
            router.push(ROUTES.login);

            return;
        }

        const failure = resolveDeleteAccountFailure(result.error, lockout);

        if (failure.next) {
            writeLockout(
                failure.next,
                login,
                DELETE_ACCOUNT_STORAGE_KEY_PREFIX,
            );
            setLockout(failure.next);
        }

        setError(t(failure.errorKey, { seconds: failure.seconds }));
    }, [deleteAccount, isLocked, lockout, login, router, password, t]);

    return {
        password,
        setPassword,
        error,
        handleSubmit,
        isLocked,
        isSubmitting,
        lockoutRemainingMs,
        lockoutTotalMs,
    };
};
