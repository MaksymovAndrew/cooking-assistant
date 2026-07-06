import React from "react";
import { useTranslation } from "react-i18next";

import type { LoginRequest } from "types/auth";

import { Button } from "components/ui/Button";
import { FormErrorBanner } from "components/ui/FormErrorBanner";
import { FormField } from "components/ui/FormField";
import { PasswordInput } from "components/ui/PasswordInput";
import { TextInput } from "components/ui/TextInput";

import { LockoutNotice } from "./LockoutNotice";
import styles from "./LoginForm.module.scss";

const USERNAME_ID = "login-username";
const PW_FIELD_ID = "login-password";

interface LoginFormProps {
    values: LoginRequest;
    onFieldChange: (field: keyof LoginRequest, value: string) => void;
    onSubmit: () => unknown;
    submitLabel: string;
    submitError?: string | null;
    isLocked?: boolean;
    lockoutRemainingMs?: number | null;
    lockoutTotalMs?: number | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
    values,
    onFieldChange,
    onSubmit,
    submitLabel,
    submitError,
    isLocked = false,
    lockoutRemainingMs = null,
    lockoutTotalMs = null,
}) => {
    const { t } = useTranslation("auth");
    const hasCredentialError = Boolean(submitError) && !isLocked;

    return (
        <form
            className={styles["login-form"]}
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            <FormField htmlFor={USERNAME_ID} label={t("fields.usernameLabel")}>
                <TextInput
                    id={USERNAME_ID}
                    value={values.login}
                    hasError={hasCredentialError}
                    disabled={isLocked}
                    onChange={(e) => {
                        onFieldChange("login", e.target.value);
                    }}
                />
            </FormField>
            <FormField htmlFor={PW_FIELD_ID} label={t("fields.passwordLabel")}>
                <PasswordInput
                    id={PW_FIELD_ID}
                    value={values.password}
                    hasError={hasCredentialError}
                    disabled={isLocked}
                    onChange={(e) => {
                        onFieldChange("password", e.target.value);
                    }}
                />
            </FormField>
            {isLocked && lockoutRemainingMs !== null ? (
                <LockoutNotice
                    remainingMs={lockoutRemainingMs}
                    totalMs={lockoutTotalMs}
                />
            ) : (
                submitError && <FormErrorBanner message={submitError} />
            )}
            <Button
                type="submit"
                disabled={isLocked}
                className={styles["login-form__submit"]}
            >
                {submitLabel}
            </Button>
        </form>
    );
};
