import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ROUTES } from "constants/routes";
import type { MenuCategory } from "types/menu";
import type { RecipeListItem } from "types/recipe";

import type { useMenuForm } from "hooks/useMenuForm";
import { useUnsavedChangesBlocker } from "hooks/useUnsavedChangesBlocker";

import { ConfirmModal } from "components/modals/ConfirmModal";
import { Button } from "components/ui/Button";

import styles from "./MenuForm.module.scss";
import { MenuFormFields } from "./MenuFormFields";
import { MenuFormRecipesCard } from "./MenuFormRecipesCard";

type MenuPageKey = "createMenuPage" | "changeMenuPage";

interface MenuFormProps {
    form: ReturnType<typeof useMenuForm>;
    categories: MenuCategory[];
    allRecipes: RecipeListItem[];
    keyPrefix: MenuPageKey;
    idPrefix: string;
    submitLabel: string;
    onSubmit: () => void;
}

export const MenuForm: React.FC<MenuFormProps> = ({
    form,
    categories,
    allRecipes,
    keyPrefix,
    idPrefix,
    submitLabel,
    onSubmit,
}) => {
    const { t } = useTranslation("menu");
    // catches every way out of a dirty form (Cancel, navbar, breadcrumb, back)
    const blocker = useUnsavedChangesBlocker(form.isDirtyRef);

    const selectedRecipes: RecipeListItem[] = [];

    form.selectedRecipes.forEach((id) => {
        const recipe = allRecipes.find((candidate) => candidate.id === id);

        if (recipe) {
            selectedRecipes.push(recipe);
        }
    });

    return (
        <form className={styles["menu-form"]}>
            <div className={styles["menu-form__grid"]}>
                <div className={styles["menu-form__column"]}>
                    <MenuFormFields
                        form={form}
                        categories={categories}
                        keyPrefix={keyPrefix}
                        idPrefix={idPrefix}
                    />
                </div>

                <div className={styles["menu-form__column"]}>
                    <MenuFormRecipesCard
                        form={form}
                        allRecipes={allRecipes}
                        selectedRecipes={selectedRecipes}
                        keyPrefix={keyPrefix}
                    />
                </div>
            </div>

            <div className={styles["menu-form__summary-bar"]}>
                <span className={styles["menu-form__summary-text"]}>
                    {t("menuForm.summary", { count: selectedRecipes.length })}
                </span>
                <div className={styles["menu-form__summary-actions"]}>
                    <Link
                        to={ROUTES.allMenus}
                        className={styles["menu-form__cancel"]}
                    >
                        {t("menuForm.cancel")}
                    </Link>
                    <Button type="button" onClick={onSubmit}>
                        {submitLabel}
                    </Button>
                </div>
            </div>

            {blocker.isBlocked && (
                <ConfirmModal
                    title={t("menuForm.discardTitle")}
                    message={t("menuForm.discardMessage")}
                    confirmLabel={t("menuForm.discardConfirm")}
                    cancelLabel={t("menuForm.discardCancel")}
                    confirmVariant="primary"
                    onClose={blocker.reset}
                    onConfirm={blocker.proceed}
                />
            )}
        </form>
    );
};
