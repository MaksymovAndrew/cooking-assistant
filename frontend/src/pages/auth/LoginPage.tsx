import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { useLoginForm } from "hooks/useLoginForm";

import { AuthLayout } from "components/auth/AuthLayout";
import { LoginForm } from "components/forms/auth/LoginForm";

import styles from "./AuthPage.module.scss";

const LoginPage: React.FC = () => {
    const { t } = useTranslation("auth");
    const form = useLoginForm();

    return (
        <AuthLayout
            tagline={t("loginPage.tagline")}
            description={t("loginPage.taglineDescription")}
        >
            <h1 className={styles["auth-page__heading"]}>
                {t("loginPage.heading")}
            </h1>
            <p className={styles["auth-page__subheading"]}>
                {t("loginPage.subheading")}
            </p>
            <LoginForm
                values={form.values}
                onFieldChange={form.setField}
                onSubmit={form.handleSubmit}
                submitLabel={t("loginPage.submit")}
                submitError={form.error}
                isLocked={form.isLocked}
                lockoutRemainingMs={form.lockoutRemainingMs}
                lockoutTotalMs={form.lockoutTotalMs}
            />
            <p className={styles["auth-page__footer"]}>
                {t("loginPage.noAccount")}{" "}
                <Link to={ROUTES.registration}>
                    {t("loginPage.registerLink")}
                </Link>
            </p>
        </AuthLayout>
    );
};

export default LoginPage;
