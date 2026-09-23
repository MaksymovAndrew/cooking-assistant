import React from "react";
import { useTranslation } from "react-i18next";

import type { RegisterErrors, RegisterRequest } from "types/auth";

import { Button } from "components/ui/Button";
import { FormErrorBanner } from "components/ui/FormErrorBanner";
import { FormField } from "components/ui/FormField";
import { PasswordInput } from "components/ui/PasswordInput";

import styles from "./RegisterForm.module.scss";
import { RegisterTextField } from "./RegisterTextField";

const NAME_ID = "register-name";
const SURNAME_ID = "register-surname";
const USERNAME_ID = "register-username";
const EMAIL_ID = "register-email";
const PW_FIELD_ID = "register-password";

interface RegisterFormProps {
    values: RegisterRequest;
    errors: RegisterErrors;
    onFieldChange: (field: keyof RegisterRequest, value: string) => void;
    onSubmit: () => unknown;
    submitLabel: string;
    submitError?: string | null;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
    values,
    errors,
    onFieldChange,
    onSubmit,
    submitLabel,
    submitError,
}) => {
    const { t } = useTranslation("auth");
    const fieldProps = { values, errors, onFieldChange };

    return (
        <form
            className={styles["register-form"]}
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            <div className={styles["register-form__name-row"]}>
                <RegisterTextField
                    field="name"
                    id={NAME_ID}
                    label={t("fields.nameLabel")}
                    {...fieldProps}
                />
                <RegisterTextField
                    field="surname"
                    id={SURNAME_ID}
                    label={t("fields.surnameLabel")}
                    {...fieldProps}
                />
            </div>
            <RegisterTextField
                field="login"
                id={USERNAME_ID}
                label={t("fields.usernameLabel")}
                {...fieldProps}
            />
            <RegisterTextField
                field="email"
                id={EMAIL_ID}
                label={t("fields.emailLabel")}
                type="email"
                {...fieldProps}
            />
            <FormField
                htmlFor={PW_FIELD_ID}
                label={t("fields.passwordLabel")}
                error={errors.password}
            >
                <PasswordInput
                    id={PW_FIELD_ID}
                    value={values.password}
                    hasError={Boolean(errors.password)}
                    onChange={(e) => {
                        onFieldChange("password", e.target.value);
                    }}
                />
            </FormField>
            {submitError && <FormErrorBanner message={submitError} />}
            <Button type="submit" className={styles["register-form__submit"]}>
                {submitLabel}
            </Button>
        </form>
    );
};
