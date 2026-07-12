import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ROUTES } from "constants/routes";
import type { Ingredient } from "types/ingredient";
import type { RecipeTypeSummary } from "types/recipeType";

import type { useRecipeForm } from "hooks/useRecipeForm";
import { useUnsavedChangesBlocker } from "hooks/useUnsavedChangesBlocker";

import { ConfirmModal } from "components/modals/ConfirmModal";
import { Button } from "components/ui/Button";

import { splitCookingTime } from "utils/cookingTimeUtils";

import styles from "./RecipeForm.module.scss";
import { RecipeFormFields } from "./RecipeFormFields";
import { RecipeFormIngredientsCard } from "./RecipeFormIngredientsCard";

type RecipePageKey = "createRecipePage" | "changeRecipePage";

interface RecipeFormProps {
    form: ReturnType<typeof useRecipeForm>;
    allIngredients: Ingredient[];
    allTypes: RecipeTypeSummary[];
    keyPrefix: RecipePageKey;
    idPrefix: string;
    submitLabel: string;
    onSubmit: () => void;
}

const MINUTES_PER_HOUR = 60;

export const RecipeForm: React.FC<RecipeFormProps> = ({
    form,
    allIngredients,
    allTypes,
    keyPrefix,
    idPrefix,
    submitLabel,
    onSubmit,
}) => {
    const { t } = useTranslation("recipes");
    // catches every way out of a dirty form (Cancel, navbar, breadcrumb, back)
    const blocker = useUnsavedChangesBlocker(form.isDirtyRef);

    const totalMinutes =
        (Number(form.cookingHours) || 0) * MINUTES_PER_HOUR +
        (Number(form.cookingMinutes) || 0);
    const { hours: summaryHours, minutes: summaryMinutes } =
        splitCookingTime(totalMinutes);

    return (
        <form className={styles["recipe-form"]}>
            <div className={styles["recipe-form__grid"]}>
                <div className={styles["recipe-form__column"]}>
                    <RecipeFormFields
                        form={form}
                        allTypes={allTypes}
                        keyPrefix={keyPrefix}
                        idPrefix={idPrefix}
                    />
                </div>

                <div className={styles["recipe-form__column"]}>
                    <RecipeFormIngredientsCard
                        form={form}
                        allIngredients={allIngredients}
                        keyPrefix={keyPrefix}
                    />
                </div>
            </div>

            <div className={styles["recipe-form__summary-bar"]}>
                <span className={styles["recipe-form__summary-text"]}>
                    {t("recipeForm.summary", {
                        count: form.selectedIngredients.length,
                        hours: summaryHours,
                        minutes: summaryMinutes,
                    })}
                </span>
                <div className={styles["recipe-form__summary-actions"]}>
                    <Link
                        to={ROUTES.allRecipes}
                        className={styles["recipe-form__cancel"]}
                    >
                        {t("recipeForm.cancel")}
                    </Link>
                    <Button type="button" onClick={onSubmit}>
                        {submitLabel}
                    </Button>
                </div>
            </div>

            {blocker.isBlocked && (
                <ConfirmModal
                    title={t("recipeForm.discardTitle")}
                    message={t("recipeForm.discardMessage")}
                    confirmLabel={t("recipeForm.discardConfirm")}
                    cancelLabel={t("recipeForm.discardCancel")}
                    confirmVariant="primary"
                    onClose={blocker.reset}
                    onConfirm={blocker.proceed}
                />
            )}
        </form>
    );
};
