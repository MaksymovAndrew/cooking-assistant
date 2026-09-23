import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";
import type { LoginRequest } from "types/auth";

import { FormField } from "components/ui/FormField";
import { Link } from "components/ui/Link";
import { PasswordInput } from "components/ui/PasswordInput";
import { TextInput } from "components/ui/TextInput";

import type { LoginMode } from "utils/loginForm";

import styles from "./LoginForm.module.scss";

const USERNAME_ID = "login-username";
const PW_FIELD_ID = "login-password";

interface LoginCredentialFieldsProps {
    values: LoginRequest;
    loginMode: LoginMode;
    hasCredentialError: boolean;
    isDisabled: boolean;
    onFieldChange: (field: keyof LoginRequest, value: string) => void;
}

export const LoginCredentialFields: React.FC<LoginCredentialFieldsProps> = ({
    values,
    loginMode,
    hasCredentialError,
    isDisabled,
    onFieldChange,
}) => {
    const { t } = useTranslation("auth");

    return (
        <>
            <FormField
                htmlFor={USERNAME_ID}
                label={
                    loginMode === "email"
                        ? t("fields.emailLabel")
                        : t("fields.usernameLabel")
                }
            >
                <TextInput
                    id={USERNAME_ID}
                    type={loginMode === "email" ? "email" : "text"}
                    value={values.login}
                    hasError={hasCredentialError}
                    disabled={isDisabled}
                    onChange={(e) => {
                        onFieldChange("login", e.target.value);
                    }}
                />
            </FormField>
            <FormField
                htmlFor={PW_FIELD_ID}
                label={t("fields.passwordLabel")}
                labelRight={
                    <Link
                        href={ROUTES.forgotPassword}
                        className={styles["login-form__forgot-password"]}
                    >
                        {t("fields.forgotPasswordLink")}
                    </Link>
                }
            >
                <PasswordInput
                    id={PW_FIELD_ID}
                    value={values.password}
                    hasError={hasCredentialError}
                    disabled={isDisabled}
                    onChange={(e) => {
                        onFieldChange("password", e.target.value);
                    }}
                />
            </FormField>
        </>
    );
};
