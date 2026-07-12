import { ChevronRight } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { useUpdateRecipePage } from "hooks/useUpdateRecipePage";

import { RecipeForm } from "components/forms/RecipeForm";
import { AppShell } from "components/layout/AppShell";

import styles from "./RecipeFormPage.module.scss";

const ChangeRecipePage: React.FC = () => {
    const { t } = useTranslation("recipes");
    const { form, allIngredients, allTypes, isLoading, handleSubmit } =
        useUpdateRecipePage();

    return (
        <AppShell>
            <div className={styles["recipe-form-page"]}>
                <nav
                    aria-label={t("changeRecipePage.breadcrumb")}
                    className={styles["recipe-form-page__breadcrumb"]}
                >
                    <Link to={ROUTES.allRecipes}>
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
