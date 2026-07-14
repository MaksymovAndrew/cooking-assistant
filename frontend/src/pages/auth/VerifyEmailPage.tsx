import { AlertTriangle, MailCheck } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { useVerifyEmail } from "hooks/useVerifyEmail";

import { AuthLayout } from "components/auth/AuthLayout";
import { PageSpinner } from "components/layout/PageSpinner";
import { EmptyState } from "components/ui/EmptyState";
import { LinkButton } from "components/ui/LinkButton";

const VerifyEmailPage: React.FC = () => {
    const { t } = useTranslation("auth");
    const { status, isAuthed } = useVerifyEmail();

    return (
        <AuthLayout
            tagline={t("verifyEmailPage.tagline")}
            description={t("verifyEmailPage.taglineDescription")}
        >
            {status === "loading" && <PageSpinner />}
            {status === "success" && (
                <EmptyState
                    icon={MailCheck}
                    title={t("verifyEmailPage.successHeading")}
                    description={t("verifyEmailPage.successMessage")}
                    action={
                        <LinkButton to={isAuthed ? ROUTES.home : ROUTES.login}>
                            {isAuthed
                                ? t("verifyEmailPage.continueToApp")
                                : t("verifyEmailPage.backToLogin")}
                        </LinkButton>
                    }
                />
            )}
            {status === "invalid" && (
                <EmptyState
                    icon={AlertTriangle}
                    title={t("verifyEmailPage.invalidHeading")}
                    description={t("verifyEmailPage.invalidMessage")}
                    action={
                        <LinkButton to={ROUTES.settings}>
                            {t("verifyEmailPage.goToSettings")}
                        </LinkButton>
                    }
                />
            )}
        </AuthLayout>
    );
};

export default VerifyEmailPage;
