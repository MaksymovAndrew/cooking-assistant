import { MailCheck } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { useForgotPasswordForm } from "hooks/useForgotPasswordForm";
import { usePageTitle } from "hooks/usePageTitle";

import { AuthLayout } from "components/auth/AuthLayout";
import { ForgotPasswordForm } from "components/forms/auth/ForgotPasswordForm";
import { EmptyState } from "components/ui/EmptyState";

import styles from "./AuthPage.module.scss";

const ForgotPasswordPage: React.FC = () => {
    const { t } = useTranslation("auth");
    const form = useForgotPasswordForm();

    usePageTitle(
        t(
            form.submitted
                ? "forgotPasswordPage.submittedHeading"
                : "forgotPasswordPage.heading",
        ),
    );

    return (
        <AuthLayout
            tagline={t("forgotPasswordPage.tagline")}
            description={t("forgotPasswordPage.taglineDescription")}
        >
            {form.submitted ? (
                <>
                    <EmptyState
                        icon={MailCheck}
                        title={t("forgotPasswordPage.submittedHeading")}
                        description={t("forgotPasswordPage.submittedMessage")}
                    />
                    <p className={styles["auth-page__hint"]}>
                        {t("forgotPasswordPage.submittedHint")}
                    </p>
                </>
            ) : (
                <>
                    <h1 className={styles["auth-page__heading"]}>
                        {t("forgotPasswordPage.heading")}
                    </h1>
                    <p className={styles["auth-page__subheading"]}>
                        {t("forgotPasswordPage.subheading")}
                    </p>
                    <ForgotPasswordForm
                        email={form.email}
                        onEmailChange={form.setEmail}
                        onSubmit={form.handleSubmit}
                        submitLabel={t("forgotPasswordPage.submit")}
                        submitError={form.error}
                    />
                </>
            )}
            <p className={styles["auth-page__footer"]}>
                <Link to={ROUTES.login}>
                    {t("forgotPasswordPage.backToLogin")}
                </Link>
            </p>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
