"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { usePageTitle } from "hooks/usePageTitle";
import { useUpdateRecipePage } from "hooks/useUpdateRecipePage";

import { EditRecordGate } from "components/forms/EditRecordGate";
import { RecipeForm } from "components/forms/RecipeForm";
import { AppShell } from "components/layout/AppShell";
import { Breadcrumb } from "components/ui/Breadcrumb";

import styles from "app/[locale]/(private)/FormPage.module.scss";

const ChangeRecipePage: React.FC = () => {
    const { t } = useTranslation("recipes");
    const { form, allIngredients, allTypes, pageState, retry, handleSubmit } =
        useUpdateRecipePage();

    usePageTitle(t("changeRecipePage.heading"));

    return (
        <AppShell skipNotices>
            <div className={styles["form-page"]}>
                <Breadcrumb
                    label={t("changeRecipePage.breadcrumb")}
                    parentHref={ROUTES.allRecipes}
                    parentLabel={t("changeRecipePage.breadcrumbRecipes")}
                    current={t("changeRecipePage.breadcrumbCurrent")}
                />
                <h1 className={styles["form-page__heading"]}>
                    {t("changeRecipePage.heading")}
                </h1>
                <EditRecordGate
                    state={pageState}
                    onRetry={retry}
                    notFoundTitle={t("changeRecipePage.notFoundTitle")}
                    notFoundDescription={t(
                        "changeRecipePage.notFoundDescription",
                    )}
                    backHref={ROUTES.allRecipes}
                    backLabel={t("changeRecipePage.backToRecipes")}
                >
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
                </EditRecordGate>
            </div>
        </AppShell>
    );
};

export default ChangeRecipePage;
