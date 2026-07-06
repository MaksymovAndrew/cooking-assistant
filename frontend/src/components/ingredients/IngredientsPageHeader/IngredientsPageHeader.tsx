import React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "components/ui/Button";

import styles from "./IngredientsPageHeader.module.scss";

interface IngredientsPageHeaderProps {
    count: number;
    isEditingQuantity: boolean;
    onToggleQuantityEdit: () => void;
    onSaveQuantities: () => void;
    onAddIngredient: () => void;
}

export const IngredientsPageHeader: React.FC<IngredientsPageHeaderProps> = ({
    count,
    isEditingQuantity,
    onToggleQuantityEdit,
    onSaveQuantities,
    onAddIngredient,
}) => {
    const { t } = useTranslation("ingredients");

    return (
        <div className={styles["ingredients-page-header"]}>
            <div>
                <h1 className={styles["ingredients-page-header__heading"]}>
                    {t("page.heading")}
                </h1>
                <p className={styles["ingredients-page-header__count"]}>
                    {t("page.itemCount", { count })}
                </p>
            </div>
            <div className={styles["ingredients-page-header__actions"]}>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={
                        isEditingQuantity
                            ? onSaveQuantities
                            : onToggleQuantityEdit
                    }
                >
                    {isEditingQuantity
                        ? t("page.saveQuantitiesButton")
                        : t("page.editQuantitiesButton")}
                </Button>
                {!isEditingQuantity && (
                    <Button type="button" onClick={onAddIngredient}>
                        {t("page.addIngredientButton")}
                    </Button>
                )}
            </div>
        </div>
    );
};
