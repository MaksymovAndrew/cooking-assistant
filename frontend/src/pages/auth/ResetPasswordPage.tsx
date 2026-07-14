import { AlertTriangle } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { useResetPasswordForm } from "hooks/useResetPasswordForm";

import { AuthLayout } from "components/auth/AuthLayout";
import { ResetPasswordForm } from "components/forms/auth/ResetPasswordForm";
import { EmptyState } from "components/ui/EmptyState";
import { LinkButton } from "components/ui/LinkButton";

import styles from "./AuthPage.module.scss";

const ResetPasswordPage: React.FC = () => {
    const { t } = useTranslation("auth");
    const form = useResetPasswordForm();

    return (
        <AuthLayout
            tagline={t("resetPasswordPage.tagline")}
            description={t("resetPasswordPage.taglineDescription")}
        >
            {form.tokenInvalid ? (
                <EmptyState
                    icon={AlertTriangle}
                    title={t("resetPasswordPage.invalidHeading")}
                    description={t("resetPasswordPage.invalidMessage")}
                    action={
                        <LinkButton to={ROUTES.forgotPassword}>
                            {t("resetPasswordPage.requestNewLink")}
                        </LinkButton>
                    }
                />
            ) : (
                <>
                    <h1 className={styles["auth-page__heading"]}>
                        {t("resetPasswordPage.heading")}
                    </h1>
                    <p className={styles["auth-page__subheading"]}>
                        {t("resetPasswordPage.subheading")}
                    </p>
                    <ResetPasswordForm
                        newPassword={form.newPassword}
                        confirmPassword={form.confirmPassword}
                        onNewPasswordChange={form.setNewPassword}
                        onConfirmPasswordChange={form.setConfirmPassword}
                        onSubmit={form.handleSubmit}
                        submitLabel={t("resetPasswordPage.submit")}
                        submitError={form.error}
                    />
                </>
            )}
            {!form.tokenInvalid && (
                <p className={styles["auth-page__footer"]}>
                    <Link to={ROUTES.login}>
                        {t("forgotPasswordPage.backToLogin")}
                    </Link>
                </p>
            )}
        </AuthLayout>
    );
};

export default ResetPasswordPage;
