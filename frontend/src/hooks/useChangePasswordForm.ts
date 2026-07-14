import type { TFunction } from "i18next";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { ERROR_CODES } from "constants/errorCodes";

import { useChangePasswordMutation } from "redux/services/authApi";

import { isValidPassword } from "utils/authValidation";
import { getQueryErrorCode } from "utils/queryError";

function getChangePasswordErrorMessage(error: unknown, t: TFunction): string {
    const code = getQueryErrorCode(error);

    if (code === ERROR_CODES.CURRENT_PASSWORD_INCORRECT) {
        return t("changePasswordModal.errors.currentPasswordIncorrect");
    }
    if (code === ERROR_CODES.NEW_PASSWORD_SAME_AS_CURRENT) {
        return t("changePasswordModal.errors.newPasswordSameAsCurrent");
    }

    return t("changePasswordModal.errors.genericError");
}

export const useChangePasswordForm = (onSuccess: () => void) => {
    const { t } = useTranslation("settings");
    const [changePassword] = useChangePasswordMutation();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = useCallback(async () => {
        setError(null);

        const hasEmptyField =
            !currentPassword || !newPassword || !confirmPassword;

        if (hasEmptyField) {
            setError(t("changePasswordModal.errors.allFieldsRequired"));

            return;
        }
        if (!isValidPassword(newPassword)) {
            setError(t("changePasswordModal.errors.passwordInvalid"));

            return;
        }
        if (newPassword !== confirmPassword) {
            setError(t("changePasswordModal.errors.passwordsDoNotMatch"));

            return;
        }

        const result = await changePassword({ currentPassword, newPassword });

        if ("data" in result) {
            onSuccess();

            return;
        }

        setError(getChangePasswordErrorMessage(result.error, t));
    }, [
        changePassword,
        confirmPassword,
        currentPassword,
        newPassword,
        onSuccess,
        t,
    ]);

    return {
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        error,
        handleSubmit,
    };
};
