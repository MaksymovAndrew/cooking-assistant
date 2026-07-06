import React from "react";
import { useTranslation } from "react-i18next";

import { useCreateMenuPage } from "hooks/useCreateMenuPage";

import { MenuForm } from "components/forms/MenuForm";
import { AppShell } from "components/layout/AppShell";

import styles from "./MenuFormPage.module.scss";

const CreateMenuPage: React.FC = () => {
    const { t } = useTranslation("menu");
    const { form, categories, allRecipes, handleSubmit } = useCreateMenuPage();

    return (
        <AppShell>
            <div className={styles["menu-form-page"]}>
                <h1 className={styles["menu-form-page__heading"]}>
                    {t("createMenuPage.heading")}
                </h1>
                <MenuForm
                    form={form}
                    categories={categories}
                    allRecipes={allRecipes}
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
