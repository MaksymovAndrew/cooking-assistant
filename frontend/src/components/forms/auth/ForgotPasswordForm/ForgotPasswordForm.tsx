import React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "components/ui/Button";
import { FormErrorBanner } from "components/ui/FormErrorBanner";
import { FormField } from "components/ui/FormField";
import { TextInput } from "components/ui/TextInput";

import styles from "./ForgotPasswordForm.module.scss";

interface ForgotPasswordFormProps {
    email: string;
    onEmailChange: (value: string) => void;
    onSubmit: () => unknown;
    submitLabel: string;
    submitError?: string | null;
}

const EMAIL_ID = "forgot-password-email";

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
    email,
    onEmailChange,
    onSubmit,
    submitLabel,
    submitError,
}) => {
    const { t } = useTranslation("auth");

    return (
        <form
            className={styles["forgot-password-form"]}
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            <FormField htmlFor={EMAIL_ID} label={t("fields.emailLabel")}>
                <TextInput
                    id={EMAIL_ID}
                    type="email"
                    value={email}
                    hasError={Boolean(submitError)}
                    onChange={(e) => {
                        onEmailChange(e.target.value);
                    }}
                />
            </FormField>
            {submitError && <FormErrorBanner message={submitError} />}
            <Button
                type="submit"
                className={styles["forgot-password-form__submit"]}
            >
                {submitLabel}
            </Button>
        </form>
    );
};
