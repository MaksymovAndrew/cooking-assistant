import React from "react";
import { useTranslation } from "react-i18next";

import type { FormPageKey } from "types/formPage";
import type { RecipeTypeSummary } from "types/recipeType";

import type { useRecipeForm } from "hooks/useRecipeForm";

import { ContentLanguageSelect } from "components/forms/ContentLanguageSelect";
import { FormPhotoCard } from "components/forms/FormPhotoCard";
import { FormCard } from "components/ui/FormCard";
import { FormField } from "components/ui/FormField";
import { Textarea } from "components/ui/Textarea";
import { TextInput } from "components/ui/TextInput";

import styles from "./RecipeForm.module.scss";
import { RecipeFormCaloriesCard } from "./RecipeFormCaloriesCard";
import { RecipeFormTypeTimeCard } from "./RecipeFormTypeTimeCard";

interface RecipeFormFieldsProps {
    form: ReturnType<typeof useRecipeForm>;
    allTypes: RecipeTypeSummary[];
    keyPrefix: FormPageKey<"Recipe">;
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
                <div className={styles["recipe-form__title-row"]}>
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
                    <ContentLanguageSelect
                        id={`${idPrefix}-language`}
                        label={t("recipeForm.languageLabel")}
                        value={form.language}
                        onChange={form.setLanguage}
                    />
                </div>
            </FormCard>

            <RecipeFormTypeTimeCard
                form={form}
                allTypes={allTypes}
                keyPrefix={keyPrefix}
                idPrefix={idPrefix}
            />

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
