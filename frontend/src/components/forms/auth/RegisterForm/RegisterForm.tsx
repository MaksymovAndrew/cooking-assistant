import React from "react";
import { useTranslation } from "react-i18next";

import type { RegisterErrors, RegisterRequest } from "types/auth";

import { Button } from "components/ui/Button";
import { FormErrorBanner } from "components/ui/FormErrorBanner";
import { FormField } from "components/ui/FormField";
import { PasswordInput } from "components/ui/PasswordInput";
import { TextInput } from "components/ui/TextInput";

import styles from "./RegisterForm.module.scss";

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

    return (
        <form
            className={styles["register-form"]}
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            <div className={styles["register-form__name-row"]}>
                <FormField
                    htmlFor={NAME_ID}
                    label={t("fields.nameLabel")}
                    error={errors.name}
                >
                    <TextInput
                        id={NAME_ID}
                        value={values.name}
                        hasError={Boolean(errors.name)}
                        onChange={(e) => {
                            onFieldChange("name", e.target.value);
                        }}
                    />
                </FormField>
                <FormField
                    htmlFor={SURNAME_ID}
                    label={t("fields.surnameLabel")}
                    error={errors.surname}
                >
                    <TextInput
                        id={SURNAME_ID}
                        value={values.surname}
                        hasError={Boolean(errors.surname)}
                        onChange={(e) => {
                            onFieldChange("surname", e.target.value);
                        }}
                    />
                </FormField>
            </div>
            <FormField
                htmlFor={USERNAME_ID}
                label={t("fields.usernameLabel")}
                error={errors.login}
            >
                <TextInput
                    id={USERNAME_ID}
                    value={values.login}
                    hasError={Boolean(errors.login)}
                    onChange={(e) => {
                        onFieldChange("login", e.target.value);
                    }}
                />
            </FormField>
            <FormField
                htmlFor={EMAIL_ID}
                label={t("fields.emailLabel")}
                error={errors.email}
            >
                <TextInput
                    id={EMAIL_ID}
                    type="email"
                    value={values.email}
                    hasError={Boolean(errors.email)}
                    onChange={(e) => {
                        onFieldChange("email", e.target.value);
                    }}
                />
            </FormField>
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
