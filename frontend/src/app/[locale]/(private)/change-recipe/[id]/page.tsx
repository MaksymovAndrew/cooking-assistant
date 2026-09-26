"use client";

import { ChevronRight } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { usePageTitle } from "hooks/usePageTitle";
import { useUpdateRecipePage } from "hooks/useUpdateRecipePage";

import { RecipeForm } from "components/forms/RecipeForm";
import { AppShell } from "components/layout/AppShell";
import { Link } from "components/ui/Link";

import styles from "app/[locale]/(private)/RecipeFormPage.module.scss";

const ChangeRecipePage: React.FC = () => {
    const { t } = useTranslation("recipes");
    const { form, allIngredients, allTypes, isLoading, handleSubmit } =
        useUpdateRecipePage();

    usePageTitle(t("changeRecipePage.heading"));

    return (
        <AppShell skipNotices>
            <div className={styles["recipe-form-page"]}>
                <nav
                    aria-label={t("changeRecipePage.breadcrumb")}
                    className={styles["recipe-form-page__breadcrumb"]}
                >
                    <Link href={ROUTES.allRecipes}>
                        {t("changeRecipePage.breadcrumbRecipes")}
                    </Link>
                    <ChevronRight size={14} aria-hidden="true" />
                    <span>{t("changeRecipePage.breadcrumbCurrent")}</span>
                </nav>
                <h1 className={styles["recipe-form-page__heading"]}>
                    {t("changeRecipePage.heading")}
                </h1>
                {isLoading ? (
                    <p>{t("changeRecipePage.loading")}</p>
                ) : (
                    <RecipeForm
                        form={form}
                        allIngredients={allIngredients}
                        allTypes={allTypes}
                        keyPrefix="changeRecipePage"
                        idPrefix="edit-recipe"
                        submitLabel={t("changeRecipePage.updateButton")}
                        onSubmit={() => {
                            void handleSubmit();
                        }}
                    />
                )}
            </div>
        </AppShell>
    );
};

export default ChangeRecipePage;
