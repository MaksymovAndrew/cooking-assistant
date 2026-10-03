"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { useCreateMenuPage } from "hooks/useCreateMenuPage";
import { usePageTitle } from "hooks/usePageTitle";

import { MenuForm } from "components/forms/MenuForm";
import { AppShell } from "components/layout/AppShell";
import { Breadcrumb } from "components/ui/Breadcrumb";

import styles from "app/[locale]/(private)/FormPage.module.scss";

const CreateMenuPage: React.FC = () => {
    const { t } = useTranslation("menu");
    const { form, categories, handleSubmit } = useCreateMenuPage();

    usePageTitle(t("createMenuPage.heading"));

    return (
        <AppShell skipNotices>
            <div className={styles["form-page"]}>
                <Breadcrumb
                    label={t("createMenuPage.breadcrumb")}
                    parentHref={ROUTES.allMenus}
                    parentLabel={t("createMenuPage.breadcrumbMenus")}
                    current={t("createMenuPage.breadcrumbCurrent")}
                />
                <h1 className={styles["form-page__heading"]}>
                    {t("createMenuPage.heading")}
                </h1>
                <MenuForm
                    form={form}
                    categories={categories}
                    keyPrefix="createMenuPage"
                    idPrefix="create-menu"
                    submitLabel={t("createMenuPage.createButton")}
                    onSubmit={() => {
                        void handleSubmit();
                    }}
                />
            </div>
        </AppShell>
    );
};

export default CreateMenuPage;
