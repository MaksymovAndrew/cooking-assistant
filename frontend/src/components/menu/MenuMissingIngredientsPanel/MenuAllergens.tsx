import React from "react";
import { useTranslation } from "react-i18next";

import styles from "./MenuMissingIngredientsPanel.module.scss";

interface MenuAllergensProps {
    allergens: string[];
}

export const MenuAllergens: React.FC<MenuAllergensProps> = ({ allergens }) => {
    const { t } = useTranslation("menu");

    if (allergens.length === 0) {
        return null;
    }

    return (
        <div
            className={
                styles["menu-missing-ingredients-panel__allergens-block"]
            }
        >
            <div
                className={
                    styles["menu-missing-ingredients-panel__allergens-head"]
                }
            >
                <span
                    className={styles["menu-missing-ingredients-panel__dot"]}
                />
                <span
                    className={
                        styles[
                            "menu-missing-ingredients-panel__allergens-label"
                        ]
                    }
                >
                    {t("menuDetailsPage.allergensAcrossMenu")}
                </span>
            </div>
            <div
                className={styles["menu-missing-ingredients-panel__allergens"]}
            >
                {allergens.map((allergen) => (
                    <span
                        key={allergen}
                        className={
                            styles["menu-missing-ingredients-panel__allergen"]
                        }
                    >
                        {allergen}
                    </span>
                ))}
            </div>
        </div>
    );
};
