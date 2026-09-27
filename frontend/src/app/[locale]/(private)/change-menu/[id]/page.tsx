"use client";

import { ChevronRight } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { usePageTitle } from "hooks/usePageTitle";
import { useUpdateMenuPage } from "hooks/useUpdateMenuPage";

import { MenuForm } from "components/forms/MenuForm";
import { AppShell } from "components/layout/AppShell";
import { Link } from "components/ui/Link";

import styles from "app/[locale]/(private)/MenuFormPage.module.scss";

const ChangeMenuPage: React.FC = () => {
    const { t } = useTranslation("menu");
    const { form, categories, allRecipes, isLoading, handleSubmit } =
        useUpdateMenuPage();

    usePageTitle(t("changeMenuPage.heading"));

    return (
        <AppShell skipNotices>
            <div className={styles["menu-form-page"]}>
                <nav
                    aria-label={t("changeMenuPage.breadcrumb")}
                    className={styles["menu-form-page__breadcrumb"]}
                >
                    <Link href={ROUTES.allMenus}>
                        {t("changeMenuPage.breadcrumbMenus")}
                    </Link>
                    <ChevronRight size={14} aria-hidden="true" />
                    <span>{t("changeMenuPage.breadcrumbCurrent")}</span>
                </nav>
                <h1 className={styles["menu-form-page__heading"]}>
                    {t("changeMenuPage.heading")}
                </h1>
                {isLoading ? (
                    <p>{t("changeMenuPage.loading")}</p>
                ) : (
                    <MenuForm
                        form={form}
                        categories={categories}
                        allRecipes={allRecipes}
                        keyPrefix="changeMenuPage"
                        idPrefix="edit-menu"
                        submitLabel={t("changeMenuPage.updateButton")}
                        onSubmit={() => {
                            void handleSubmit();
                        }}
                    />
                )}
            </div>
        </AppShell>
    );
};

export default ChangeMenuPage;
