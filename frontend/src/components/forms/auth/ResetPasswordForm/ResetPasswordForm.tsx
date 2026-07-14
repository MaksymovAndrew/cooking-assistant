import React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "components/ui/Button";
import { FormErrorBanner } from "components/ui/FormErrorBanner";
import { FormField } from "components/ui/FormField";
import { PasswordInput } from "components/ui/PasswordInput";

import styles from "./ResetPasswordForm.module.scss";

interface ResetPasswordFormProps {
    newPassword: string;
    confirmPassword: string;
    onNewPasswordChange: (value: string) => void;
    onConfirmPasswordChange: (value: string) => void;
    onSubmit: () => unknown;
    submitLabel: string;
    submitError?: string | null;
}

const NEW_PW_FIELD_ID = "reset-password-new";
const CONFIRM_PW_FIELD_ID = "reset-password-confirm";

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
    newPassword,
    confirmPassword,
    onNewPasswordChange,
    onConfirmPasswordChange,
    onSubmit,
    submitLabel,
    submitError,
}) => {
    const { t } = useTranslation("auth");

    return (
        <form
            className={styles["reset-password-form"]}
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            <FormField
                htmlFor={NEW_PW_FIELD_ID}
                label={t("fields.newPasswordLabel")}
            >
                <PasswordInput
                    id={NEW_PW_FIELD_ID}
                    value={newPassword}
                    hasError={Boolean(submitError)}
                    onChange={(e) => {
                        onNewPasswordChange(e.target.value);
                    }}
                />
            </FormField>
            <FormField
                htmlFor={CONFIRM_PW_FIELD_ID}
                label={t("fields.confirmPasswordLabel")}
            >
                <PasswordInput
                    id={CONFIRM_PW_FIELD_ID}
                    value={confirmPassword}
                    hasError={Boolean(submitError)}
                    onChange={(e) => {
                        onConfirmPasswordChange(e.target.value);
                    }}
                />
            </FormField>
            {submitError && <FormErrorBanner message={submitError} />}
            <Button
                type="submit"
                className={styles["reset-password-form__submit"]}
            >
                {submitLabel}
            </Button>
        </form>
    );
};
