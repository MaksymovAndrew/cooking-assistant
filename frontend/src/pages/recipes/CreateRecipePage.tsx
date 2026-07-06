import React from "react";
import { useTranslation } from "react-i18next";

import { useCreateRecipePage } from "hooks/useCreateRecipePage";

import { RecipeForm } from "components/forms/RecipeForm";
import { AppShell } from "components/layout/AppShell";

import styles from "./RecipeFormPage.module.scss";

const CreateRecipePage: React.FC = () => {
    const { t } = useTranslation("recipes");
    const { form, allIngredients, allTypes, handleSubmit } =
        useCreateRecipePage();

    return (
        <AppShell>
            <div className={styles["recipe-form-page"]}>
                <h1 className={styles["recipe-form-page__heading"]}>
                    {t("createRecipePage.heading")}
                </h1>
                <RecipeForm
                    form={form}
                    allIngredients={allIngredients}
                    allTypes={allTypes}
                    keyPrefix="createRecipePage"
                    idPrefix="create-recipe"
                    cookingTimePlaceholder={t(
                        "createRecipePage.cookingTimePlaceholder",
                    )}
                    typeError={form.typeError}
                    error={form.error}
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
