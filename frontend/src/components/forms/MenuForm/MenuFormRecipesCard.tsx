import { Info } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { FormPageKey } from "types/formPage";
import type { RecipeListItem } from "types/recipe";

import type { useMenuForm } from "hooks/useMenuForm";

import { RecipePicker } from "components/menu/RecipePicker";
import { SelectedRecipesList } from "components/menu/SelectedRecipesList";
import { FormCard } from "components/ui/FormCard";

import { recipeIdsOf } from "utils/menuFormRecipes";

import styles from "./MenuForm.module.scss";

interface MenuFormRecipesCardProps {
    form: ReturnType<typeof useMenuForm>;
    selectedRecipes: RecipeListItem[];
    keyPrefix: FormPageKey<"Menu">;
}

const HINT_ICON_SIZE = 14;

export const MenuFormRecipesCard: React.FC<MenuFormRecipesCardProps> = ({
    form,
    selectedRecipes,
    keyPrefix,
}) => {
    const { t } = useTranslation("menu");

    return (
        <FormCard>
            <div className={styles["menu-form__recipes-head"]}>
                <span className={styles["menu-form__recipes-title"]}>
                    {t(`${keyPrefix}.recipesLabel`)}
                </span>
                <span className={styles["menu-form__recipes-count"]}>
                    {t("menuForm.recipesAdded", {
                        count: selectedRecipes.length,
                    })}
                </span>
            </div>

            <RecipePicker
                selectedIds={recipeIdsOf(selectedRecipes)}
                label={t(`${keyPrefix}.recipesLabel`)}
                onToggle={form.toggleRecipeSelection}
            />

            {selectedRecipes.length > 0 && (
                <div className={styles["menu-form__selected"]}>
                    <SelectedRecipesList
                        recipes={selectedRecipes}
                        onRemove={form.removeRecipe}
                        onReorder={form.reorderSelectedRecipes}
                    />
                </div>
            )}

            {form.errors.recipesError && (
                <p className={styles["menu-form__error"]} role="alert">
                    {form.errors.recipesError}
                </p>
            )}

            <p className={styles["menu-form__reorder-hint"]}>
                <Info size={HINT_ICON_SIZE} aria-hidden="true" />
                {t("menuForm.reorderHint")}
            </p>
        </FormCard>
    );
};
