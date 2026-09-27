import { Ban } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { useAvoidedIngredients } from "hooks/useAvoidedIngredients";

import { resolveAllergen } from "utils/ingredientName";

import styles from "./MenuMissingIngredientsPanel.module.scss";

const ALLERGEN_ICON_SIZE = 11;

interface MenuAllergensProps {
    allergens: string[];
}

export const MenuAllergens: React.FC<MenuAllergensProps> = ({ allergens }) => {
    const { t } = useTranslation("menu");
    const { isAllergenAvoided } = useAvoidedIngredients();

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
                {allergens.map((allergen) => {
                    const isAvoided = isAllergenAvoided(allergen);

                    return (
                        <span
                            key={allergen}
                            className={[
                                styles[
                                    "menu-missing-ingredients-panel__allergen"
                                ],
                                isAvoided &&
                                    styles[
                                        "menu-missing-ingredients-panel__allergen--avoided"
                                    ],
                            ]
                                .filter(Boolean)
                                .join(" ")}
                        >
                            {isAvoided && (
                                <Ban
                                    size={ALLERGEN_ICON_SIZE}
                                    aria-hidden="true"
                                />
                            )}
                            {resolveAllergen(t, allergen)}
                            {isAvoided && (
                                <span
                                    className={
                                        styles[
                                            "menu-missing-ingredients-panel__sr-only"
                                        ]
                                    }
                                >
                                    {t("dietPreferences:avoidedRow")}
                                </span>
                            )}
                        </span>
                    );
                })}
            </div>
        </div>
    );
};
