import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { useRegisterForm } from "hooks/useRegisterForm";

import { AuthLayout } from "components/auth/AuthLayout";
import { RegisterForm } from "components/forms/auth/RegisterForm";

import styles from "./AuthPage.module.scss";

const RegisterPage: React.FC = () => {
    const { t } = useTranslation("auth");
    const form = useRegisterForm();

    return (
        <AuthLayout
            tagline={t("registerPage.tagline")}
            description={t("registerPage.taglineDescription")}
            brandIcon
        >
            <h1 className={styles["auth-page__heading"]}>
                {t("registerPage.heading")}
            </h1>
            <RegisterForm
                values={form.values}
                errors={form.errors}
                onFieldChange={form.setField}
                onSubmit={form.handleSubmit}
                submitLabel={t("registerPage.submit")}
                submitError={form.error}
            />
            <p className={styles["auth-page__footer"]}>
                {t("registerPage.haveAccount")}{" "}
                <Link to={ROUTES.login}>{t("registerPage.loginLink")}</Link>
            </p>
        </AuthLayout>
    );
};

export default RegisterPage;
