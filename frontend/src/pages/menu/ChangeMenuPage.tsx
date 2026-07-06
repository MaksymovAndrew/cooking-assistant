import React from "react";
import { useTranslation } from "react-i18next";

import { useUpdateMenuPage } from "hooks/useUpdateMenuPage";

import { MenuForm } from "components/forms/MenuForm";
import { AppShell } from "components/layout/AppShell";

import styles from "./MenuFormPage.module.scss";

const ChangeMenuPage: React.FC = () => {
    const { t } = useTranslation("menu");
    const { form, categories, allRecipes, isLoading, handleSubmit } =
        useUpdateMenuPage();

    return (
        <AppShell>
            <div className={styles["menu-form-page"]}>
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
