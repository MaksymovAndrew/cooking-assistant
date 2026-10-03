"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { usePageTitle } from "hooks/usePageTitle";
import { useUpdateMenuPage } from "hooks/useUpdateMenuPage";

import { EditRecordGate } from "components/forms/EditRecordGate";
import { MenuForm } from "components/forms/MenuForm";
import { AppShell } from "components/layout/AppShell";
import { Breadcrumb } from "components/ui/Breadcrumb";

import styles from "app/[locale]/(private)/FormPage.module.scss";

const ChangeMenuPage: React.FC = () => {
    const { t } = useTranslation("menu");
    const { form, categories, pageState, retry, handleSubmit } =
        useUpdateMenuPage();

    usePageTitle(t("changeMenuPage.heading"));

    return (
        <AppShell skipNotices>
            <div className={styles["form-page"]}>
                <Breadcrumb
                    label={t("changeMenuPage.breadcrumb")}
                    parentHref={ROUTES.allMenus}
                    parentLabel={t("changeMenuPage.breadcrumbMenus")}
                    current={t("changeMenuPage.breadcrumbCurrent")}
                />
                <h1 className={styles["form-page__heading"]}>
                    {t("changeMenuPage.heading")}
                </h1>
                <EditRecordGate
                    state={pageState}
                    onRetry={retry}
                    notFoundTitle={t("changeMenuPage.notFoundTitle")}
                    notFoundDescription={t(
                        "changeMenuPage.notFoundDescription",
                    )}
                    backHref={ROUTES.allMenus}
                    backLabel={t("changeMenuPage.backToMenus")}
                >
                    <MenuForm
                        form={form}
                        categories={categories}
                        keyPrefix="changeMenuPage"
                        idPrefix="edit-menu"
                        submitLabel={t("changeMenuPage.updateButton")}
                        onSubmit={() => {
                            void handleSubmit();
                        }}
                    />
                </EditRecordGate>
            </div>
        </AppShell>
    );
};

export default ChangeMenuPage;
