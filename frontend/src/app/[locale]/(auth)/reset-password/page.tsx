"use client";

import { AlertTriangle } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { usePageTitle } from "hooks/usePageTitle";
import { useResetPasswordForm } from "hooks/useResetPasswordForm";

import { AuthLayout } from "components/auth/AuthLayout";
import { ResetPasswordForm } from "components/forms/auth/ResetPasswordForm";
import { EmptyState } from "components/ui/EmptyState";
import { Link } from "components/ui/Link";
import { LinkButton } from "components/ui/LinkButton";

import styles from "app/[locale]/(auth)/AuthPage.module.scss";

const ResetPasswordPage: React.FC = () => {
    const { t } = useTranslation("auth");
    const form = useResetPasswordForm();

    usePageTitle(
        t(
            form.tokenInvalid
                ? "resetPasswordPage.invalidHeading"
                : "resetPasswordPage.heading",
        ),
    );

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
                        <LinkButton href={ROUTES.forgotPassword}>
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
                    <Link href={ROUTES.login}>
                        {t("forgotPasswordPage.backToLogin")}
                    </Link>
                </p>
            )}
        </AuthLayout>
    );
};

export default ResetPasswordPage;
