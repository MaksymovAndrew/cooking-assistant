import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";
import type { FormPageKey } from "types/formPage";
import type { MenuCategory } from "types/menu";

import type { useMenuForm } from "hooks/useMenuForm";
import { useUnsavedChangesBlocker } from "hooks/useUnsavedChangesBlocker";

import { ConfirmModal } from "components/modals/ConfirmModal";
import { Button } from "components/ui/Button";
import { Link } from "components/ui/Link";

import styles from "./MenuForm.module.scss";
import { MenuFormFields } from "./MenuFormFields";
import { MenuFormRecipesCard } from "./MenuFormRecipesCard";

interface MenuFormProps {
    form: ReturnType<typeof useMenuForm>;
    categories: MenuCategory[];
    keyPrefix: FormPageKey<"Menu">;
    idPrefix: string;
    submitLabel: string;
    onSubmit: () => void;
}

export const MenuForm: React.FC<MenuFormProps> = ({
    form,
    categories,
    keyPrefix,
    idPrefix,
    submitLabel,
    onSubmit,
}) => {
    const { t } = useTranslation("menu");
    const blocker = useUnsavedChangesBlocker(form.isDirty, form.isDirtyRef);

    const { selectedRecipes, attachForm } = form;

    return (
        <form ref={attachForm} className={styles["menu-form"]}>
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
                        href={ROUTES.allMenus}
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
