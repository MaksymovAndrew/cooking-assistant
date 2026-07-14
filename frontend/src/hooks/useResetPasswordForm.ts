import type { TFunction } from "i18next";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import { ERROR_CODES } from "constants/errorCodes";
import { ROUTES } from "constants/routes";

import { useResetPasswordMutation } from "redux/services/authApi";

import { isValidPassword } from "utils/authValidation";
import { getQueryErrorCode, getQueryErrorStatus } from "utils/queryError";

const SERVER_ERROR_STATUS_THRESHOLD = 500;

// INVALID_OR_EXPIRED_TOKEN is handled separately by the caller (flips tokenInvalid), so this covers the rest
function getResetPasswordErrorMessage(error: unknown, t: TFunction): string {
    if (getQueryErrorCode(error) === ERROR_CODES.NEW_PASSWORD_SAME_AS_CURRENT) {
        return t("errors.newPasswordSameAsCurrent");
    }

    const status = getQueryErrorStatus(error);

    if (status !== null && status >= SERVER_ERROR_STATUS_THRESHOLD) {
        return t("errors.serverError");
    }

    return t("errors.resetPasswordFailed");
}

export const useResetPasswordForm = () => {
    const { t } = useTranslation("auth");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [resetPassword] = useResetPasswordMutation();

    const token = searchParams.get("token") ?? "";
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [tokenInvalid, setTokenInvalid] = useState(!token);

    const handleSubmit = useCallback(async () => {
        setError(null);

        if (!newPassword || !confirmPassword) {
            setError(t("errors.allFieldsRequired"));

            return;
        }
        if (!isValidPassword(newPassword)) {
            setError(t("errors.password"));

            return;
        }
        if (newPassword !== confirmPassword) {
            setError(t("errors.passwordsDoNotMatch"));

            return;
        }

        const result = await resetPassword({ token, newPassword });

        if ("data" in result) {
            void navigate(ROUTES.login);

            return;
        }

        if (
            getQueryErrorCode(result.error) ===
            ERROR_CODES.INVALID_OR_EXPIRED_TOKEN
        ) {
            setTokenInvalid(true);

            return;
        }

        setError(getResetPasswordErrorMessage(result.error, t));
    }, [confirmPassword, navigate, newPassword, resetPassword, t, token]);

    return {
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        error,
        tokenInvalid,
        handleSubmit,
    };
};
