import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ROUTES } from "constants/routes";
import type { Ingredient } from "types/ingredient";
import type { RecipeTypeSummary } from "types/recipeType";

import type { useRecipeForm } from "hooks/useRecipeForm";

import { CookingTimeField } from "components/recipes/CookingTimeField";
import { IngredientPicker } from "components/recipes/IngredientPicker";
import { RecipeTypeSelect } from "components/recipes/RecipeTypeSelect";
import { SelectedIngredientsList } from "components/recipes/SelectedIngredientsList";
import { ServingsField } from "components/recipes/ServingsField";
import { Button } from "components/ui/Button";
import { FormErrorBanner } from "components/ui/FormErrorBanner";
import { FormField } from "components/ui/FormField";
import { Textarea } from "components/ui/Textarea";
import { TextInput } from "components/ui/TextInput";

import styles from "./RecipeForm.module.scss";

type RecipePageKey = "createRecipePage" | "changeRecipePage";

interface RecipeFormProps {
    form: ReturnType<typeof useRecipeForm>;
    allIngredients: Ingredient[];
    allTypes: RecipeTypeSummary[];
    keyPrefix: RecipePageKey;
    idPrefix: string;
    typeError: string | null;
    error: string | null;
    cookingTimePlaceholder?: string;
    submitLabel: string;
    onSubmit: () => void;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({
    form,
    allIngredients,
    allTypes,
    keyPrefix,
    idPrefix,
    typeError,
    error,
    cookingTimePlaceholder,
    submitLabel,
    onSubmit,
}) => {
    const { t } = useTranslation("recipes");

    return (
        <form className={styles["recipe-form"]}>
            <FormField
                htmlFor={`${idPrefix}-title`}
                label={t(`${keyPrefix}.titleLabel`)}
            >
                <TextInput
                    id={`${idPrefix}-title`}
                    value={form.title}
                    onChange={(e) => {
                        form.setTitle(e.target.value);
                    }}
                />
            </FormField>
            <FormField
                htmlFor={`${idPrefix}-description`}
                label={t(`${keyPrefix}.descriptionLabel`)}
            >
                <Textarea
                    id={`${idPrefix}-description`}
                    rows={4}
                    value={form.content}
                    onChange={(e) => {
                        form.setContent(e.target.value);
                    }}
                />
            </FormField>
            <CookingTimeField
                id={`${idPrefix}-cooking-time`}
                label={t(`${keyPrefix}.cookingTimeLabel`)}
                placeholder={cookingTimePlaceholder}
                value={form.cookingTime}
                error={form.cookingTimeError}
                onChange={form.setCookingTime}
            />
            <RecipeTypeSelect
                id={`${idPrefix}-type`}
                label={t(`${keyPrefix}.recipeTypeLabel`)}
                placeholder={t(`${keyPrefix}.recipeTypePlaceholder`)}
                types={allTypes}
                value={form.selectedTypeId}
                error={typeError}
                onChange={form.setSelectedTypeId}
            />
            <ServingsField
                id={`${idPrefix}-servings`}
                label={t(`${keyPrefix}.servingsLabel`)}
                placeholder={t(`${keyPrefix}.servingsPlaceholder`)}
                value={form.servings}
                onChange={form.setServings}
            />
            <IngredientPicker
                allIngredients={allIngredients}
                selectedIds={form.selectedIngredients.map((i) => i.id)}
                label={t(`${keyPrefix}.ingredientsLabel`)}
                onToggle={form.toggleIngredientSelection}
            />
            <SelectedIngredientsList
                ingredients={form.selectedIngredients}
                heading={t(`${keyPrefix}.selectedIngredients`)}
                onQuantityChange={form.updateIngredientQuantity}
                onRemove={form.toggleIngredientSelection}
            />
            {error && <FormErrorBanner message={error} />}
            <div className={styles["recipe-form__save-panel"]}>
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
        </form>
    );
};
