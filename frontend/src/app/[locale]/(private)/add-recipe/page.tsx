"use client";

import { ChevronRight } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { useCreateRecipePage } from "hooks/useCreateRecipePage";
import { usePageTitle } from "hooks/usePageTitle";

import { RecipeForm } from "components/forms/RecipeForm";
import { AppShell } from "components/layout/AppShell";
import { Link } from "components/ui/Link";

import styles from "app/[locale]/(private)/RecipeFormPage.module.scss";

const CreateRecipePage: React.FC = () => {
    const { t } = useTranslation("recipes");
    const { form, allIngredients, allTypes, handleSubmit } =
        useCreateRecipePage();

    usePageTitle(t("createRecipePage.heading"));

    return (
        <AppShell skipNotices>
            <div className={styles["recipe-form-page"]}>
                <nav
                    aria-label={t("createRecipePage.breadcrumb")}
                    className={styles["recipe-form-page__breadcrumb"]}
                >
                    <Link href={ROUTES.allRecipes}>
                        {t("createRecipePage.breadcrumbRecipes")}
                    </Link>
                    <ChevronRight size={14} aria-hidden="true" />
                    <span>{t("createRecipePage.breadcrumbCurrent")}</span>
                </nav>
                <h1 className={styles["recipe-form-page__heading"]}>
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
