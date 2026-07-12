import { Info } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";

import type { useRecipeForm } from "hooks/useRecipeForm";

import { IngredientPicker } from "components/recipes/IngredientPicker";
import { SelectedIngredientsList } from "components/recipes/SelectedIngredientsList";
import { FormCard } from "components/ui/FormCard";

import styles from "./RecipeForm.module.scss";

type RecipePageKey = "createRecipePage" | "changeRecipePage";

interface RecipeFormIngredientsCardProps {
    form: ReturnType<typeof useRecipeForm>;
    allIngredients: Ingredient[];
    keyPrefix: RecipePageKey;
}

const HINT_ICON_SIZE = 14;

export const RecipeFormIngredientsCard: React.FC<
    RecipeFormIngredientsCardProps
> = ({ form, allIngredients, keyPrefix }) => {
    const { t } = useTranslation("recipes");

    return (
        <FormCard>
            <div className={styles["recipe-form__ingredients-head"]}>
                <div>
                    <span className={styles["recipe-form__ingredients-title"]}>
                        {t(`${keyPrefix}.ingredientsLabel`)}
                    </span>
                    <span className={styles["recipe-form__ingredients-count"]}>
                        {t("recipeForm.itemsAdded", {
                            count: form.selectedIngredients.length,
                        })}
                    </span>
                </div>
            </div>
            <p className={styles["recipe-form__ingredients-hint"]}>
                <Info size={HINT_ICON_SIZE} aria-hidden="true" />
                {t("recipeForm.perPortionHint")}
            </p>

            <IngredientPicker
                allIngredients={allIngredients}
                selectedIds={form.selectedIngredients.map((i) => i.id)}
                label={t(`${keyPrefix}.ingredientsLabel`)}
                onToggle={form.toggleIngredientSelection}
            />

            {form.selectedIngredients.length > 0 && (
                <div className={styles["recipe-form__selected-ingredients"]}>
                    <SelectedIngredientsList
                        ingredients={form.selectedIngredients}
                        onQuantityChange={form.updateIngredientQuantity}
                        onRemove={form.removeIngredient}
                        onReorder={form.reorderIngredients}
                    />
                </div>
            )}

            {form.ingredientsError && (
                <p className={styles["recipe-form__error"]} role="alert">
                    {form.ingredientsError}
                </p>
            )}

            <p className={styles["recipe-form__reorder-hint"]}>
                <Info size={HINT_ICON_SIZE} aria-hidden="true" />
                {t("recipeForm.reorderHint")}
            </p>
        </FormCard>
    );
};
