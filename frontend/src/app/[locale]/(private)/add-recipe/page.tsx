"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { useCreateRecipePage } from "hooks/useCreateRecipePage";
import { usePageTitle } from "hooks/usePageTitle";

import { RecipeForm } from "components/forms/RecipeForm";
import { AppShell } from "components/layout/AppShell";
import { Breadcrumb } from "components/ui/Breadcrumb";

import styles from "app/[locale]/(private)/FormPage.module.scss";

const CreateRecipePage: React.FC = () => {
    const { t } = useTranslation("recipes");
    const { form, allIngredients, allTypes, handleSubmit } =
        useCreateRecipePage();

    usePageTitle(t("createRecipePage.heading"));

    return (
        <AppShell skipNotices>
            <div className={styles["form-page"]}>
                <Breadcrumb
                    label={t("createRecipePage.breadcrumb")}
                    parentHref={ROUTES.allRecipes}
                    parentLabel={t("createRecipePage.breadcrumbRecipes")}
                    current={t("createRecipePage.breadcrumbCurrent")}
                />
                <h1 className={styles["form-page__heading"]}>
                    {t("createRecipePage.heading")}
                </h1>
                <RecipeForm
                    form={form}
                    allIngredients={allIngredients}
                    allTypes={allTypes}
                    keyPrefix="createRecipePage"
                    idPrefix="create-recipe"
                    submitLabel={t("createRecipePage.createButton")}
                    onSubmit={() => {
                        void handleSubmit();
                    }}
                />
            </div>
        </AppShell>
    );
};

export default CreateRecipePage;
