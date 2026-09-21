import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeTypeSummary } from "types/recipeType";

import type { useRecipeForm } from "hooks/useRecipeForm";

import { FormPhotoCard } from "components/forms/FormPhotoCard";
import { CookingTimeField } from "components/recipes/CookingTimeField";
import { RecipeTypeSelect } from "components/recipes/RecipeTypeSelect";
import { FormCard } from "components/ui/FormCard";
import { FormField } from "components/ui/FormField";
import { Textarea } from "components/ui/Textarea";
import { TextInput } from "components/ui/TextInput";

import styles from "./RecipeForm.module.scss";
import { RecipeFormCaloriesCard } from "./RecipeFormCaloriesCard";

type RecipePageKey = "createRecipePage" | "changeRecipePage";

interface RecipeFormFieldsProps {
    form: ReturnType<typeof useRecipeForm>;
    allTypes: RecipeTypeSummary[];
    keyPrefix: RecipePageKey;
    idPrefix: string;
}

export const RecipeFormFields: React.FC<RecipeFormFieldsProps> = ({
    form,
    allTypes,
    keyPrefix,
    idPrefix,
}) => {
    const { t } = useTranslation("recipes");

    return (
        <>
            <FormPhotoCard
                photo={form.photo}
                title={t("recipeForm.photoTitle")}
                alt={t("recipeForm.photoAlt")}
            />

            <FormCard>
                <FormField
                    htmlFor={`${idPrefix}-title`}
                    label={t(`${keyPrefix}.titleLabel`)}
                    error={form.titleError}
                >
                    <TextInput
                        id={`${idPrefix}-title`}
                        value={form.title}
                        hasError={Boolean(form.titleError)}
                        onChange={(e) => {
                            form.setTitle(e.target.value);
                        }}
                    />
                </FormField>
            </FormCard>

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

            <FormCard>
                <FormField
                    htmlFor={`${idPrefix}-description`}
                    label={t(`${keyPrefix}.descriptionLabel`)}
                    error={form.descriptionError}
                >
                    <Textarea
                        id={`${idPrefix}-description`}
                        rows={4}
                        value={form.content}
                        hasError={Boolean(form.descriptionError)}
                        onChange={(e) => {
                            form.setContent(e.target.value);
                        }}
                    />
                </FormField>
            </FormCard>

            <RecipeFormCaloriesCard
                id={`${idPrefix}-calories`}
                value={form.caloriesOverride}
                ingredients={form.selectedIngredients}
                onChange={form.setCaloriesOverride}
            />
        </>
    );
};
