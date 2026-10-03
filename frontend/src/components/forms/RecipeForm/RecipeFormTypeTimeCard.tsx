import React from "react";
import { useTranslation } from "react-i18next";

import type { FormPageKey } from "types/formPage";
import type { RecipeTypeSummary } from "types/recipeType";

import type { useRecipeForm } from "hooks/useRecipeForm";

import { CookingTimeField } from "components/recipes/CookingTimeField";
import { RecipeTypeSelect } from "components/recipes/RecipeTypeSelect";
import { FormCard } from "components/ui/FormCard";

import styles from "./RecipeForm.module.scss";

interface RecipeFormTypeTimeCardProps {
    form: ReturnType<typeof useRecipeForm>;
    allTypes: RecipeTypeSummary[];
    keyPrefix: FormPageKey<"Recipe">;
    idPrefix: string;
}

export const RecipeFormTypeTimeCard: React.FC<RecipeFormTypeTimeCardProps> = ({
    form,
    allTypes,
    keyPrefix,
    idPrefix,
}) => {
    const { t } = useTranslation("recipes");

    return (
        <FormCard>
            <div className={styles["recipe-form__type-time-row"]}>
                <RecipeTypeSelect
                    id={`${idPrefix}-type`}
                    label={t(`${keyPrefix}.recipeTypeLabel`)}
                    placeholder={t(`${keyPrefix}.recipeTypePlaceholder`)}
                    types={allTypes}
                    value={form.selectedTypeId}
                    error={form.typeError}
                    onChange={form.setSelectedTypeId}
                />
                <CookingTimeField
                    id={`${idPrefix}-cooking-time`}
                    label={t(`${keyPrefix}.cookingTimeLabel`)}
                    hours={form.cookingHours}
                    minutes={form.cookingMinutes}
                    error={form.cookingTimeError}
                    onHoursChange={form.setCookingHours}
                    onMinutesChange={form.setCookingMinutes}
                />
            </div>
        </FormCard>
    );
};
