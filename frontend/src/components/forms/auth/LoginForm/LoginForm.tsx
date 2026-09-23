import React from "react";
import { useTranslation } from "react-i18next";

import type { LoginRequest } from "types/auth";

import { Button } from "components/ui/Button";
import { FormErrorBanner } from "components/ui/FormErrorBanner";
import { SegmentedControl } from "components/ui/SegmentedControl";

import type { LoginMode } from "utils/loginForm";

import { LockoutNotice } from "./LockoutNotice";
import { LoginCredentialFields } from "./LoginCredentialFields";
import styles from "./LoginForm.module.scss";

interface LoginFormProps {
    values: LoginRequest;
    onFieldChange: (field: keyof LoginRequest, value: string) => void;
    loginMode: LoginMode;
    onModeChange: (mode: LoginMode) => void;
    onSubmit: () => unknown;
    submitLabel: string;
    submitError?: string | null;
    isLocked?: boolean;
    isSubmitting?: boolean;
    lockoutRemainingMs?: number | null;
    lockoutTotalMs?: number | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
    values,
    onFieldChange,
    loginMode,
    onModeChange,
    onSubmit,
    submitLabel,
    submitError,
    isLocked = false,
    isSubmitting = false,
    lockoutRemainingMs = null,
    lockoutTotalMs = null,
}) => {
    const { t } = useTranslation("auth");
    const hasCredentialError = Boolean(submitError) && !isLocked;
    const modeOptions = [
        { value: "username" as const, label: t("fields.usernameLabel") },
        { value: "email" as const, label: t("fields.emailLabel") },
    ];

    return (
        <form
            className={styles["login-form"]}
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            <div className={styles["login-form__mode-toggle"]}>
                <SegmentedControl
                    label={t("fields.loginModeLabel")}
                    options={modeOptions}
                    value={loginMode}
                    onChange={onModeChange}
                />
            </div>
            <LoginCredentialFields
                values={values}
                loginMode={loginMode}
                hasCredentialError={hasCredentialError}
                isDisabled={isLocked || isSubmitting}
                onFieldChange={onFieldChange}
            />
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
                loading={isSubmitting}
                className={styles["login-form__submit"]}
            >
                {submitLabel}
            </Button>
        </form>
    );
};
