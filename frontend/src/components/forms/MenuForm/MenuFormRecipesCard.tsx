import { Info } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeListItem } from "types/recipe";

import type { useMenuForm } from "hooks/useMenuForm";

import { RecipePicker } from "components/menu/RecipePicker";
import { SelectedRecipesList } from "components/menu/SelectedRecipesList";
import { FormCard } from "components/ui/FormCard";

import styles from "./MenuForm.module.scss";

type MenuPageKey = "createMenuPage" | "changeMenuPage";

interface MenuFormRecipesCardProps {
    form: ReturnType<typeof useMenuForm>;
    allRecipes: RecipeListItem[];
    selectedRecipes: RecipeListItem[];
    keyPrefix: MenuPageKey;
}

const HINT_ICON_SIZE = 14;

export const MenuFormRecipesCard: React.FC<MenuFormRecipesCardProps> = ({
    form,
    allRecipes,
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
                allRecipes={allRecipes}
                selectedIds={form.selectedRecipes}
                label={t(`${keyPrefix}.recipesLabel`)}
                onToggle={(recipe) => {
                    form.toggleRecipeSelection(recipe.id);
                }}
            />

            {selectedRecipes.length > 0 && (
                <div className={styles["menu-form__selected"]}>
                    <SelectedRecipesList
                        recipes={selectedRecipes}
                        onRemove={form.toggleRecipeSelection}
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
