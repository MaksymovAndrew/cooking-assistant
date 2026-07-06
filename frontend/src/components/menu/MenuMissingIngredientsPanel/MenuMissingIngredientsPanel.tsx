import React from "react";
import { useTranslation } from "react-i18next";

import type { AggregatedIngredient } from "utils/menuUtils";

import styles from "./MenuMissingIngredientsPanel.module.scss";

interface MenuMissingIngredientsPanelProps {
    ingredients: Record<string, AggregatedIngredient>;
}

export const MenuMissingIngredientsPanel: React.FC<
    MenuMissingIngredientsPanelProps
> = ({ ingredients }) => {
    const { t } = useTranslation("menu");
    const entries = Object.entries(ingredients);

    return (
        <aside className={styles["menu-missing-ingredients-panel"]}>
            <div className={styles["menu-missing-ingredients-panel__header"]}>
                <span
                    className={styles["menu-missing-ingredients-panel__title"]}
                >
                    {t("menuDetailsPage.missingIngredients")}
                </span>
                <span
                    className={styles["menu-missing-ingredients-panel__badge"]}
                >
                    {entries.length}
                </span>
            </div>
            {entries.length === 0 ? (
                <p className={styles["menu-missing-ingredients-panel__empty"]}>
                    {t("menuDetailsPage.noMissingIngredients")}
                </p>
            ) : (
                <ul className={styles["menu-missing-ingredients-panel__list"]}>
                    {entries.map(([name, { quantity, unit }]) => (
                        <li
                            key={name}
                            className={
                                styles["menu-missing-ingredients-panel__row"]
                            }
                        >
                            <span
                                className={
                                    styles[
                                        "menu-missing-ingredients-panel__name"
                                    ]
                                }
                            >
                                {name}
                            </span>
                            <span
                                className={
                                    styles[
                                        "menu-missing-ingredients-panel__qty"
                                    ]
                                }
                            >
                                {quantity} {unit}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    );
};
