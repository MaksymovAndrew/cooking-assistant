import { Check } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { BasketAddMark } from "components/icons";

import { resolveIngredientName, resolveUnit } from "utils/ingredientName";
import type { AggregatedIngredient } from "utils/menuUtils";

import { MenuAllergens } from "./MenuAllergens";
import styles from "./MenuMissingIngredientsPanel.module.scss";

interface MenuMissingIngredientsPanelProps {
    ingredients: Record<number, AggregatedIngredient>;
    allergens: string[];
}

const BUTTON_ICON_SIZE = 15;
const CHECK_ICON_SIZE = 13;

export const MenuMissingIngredientsPanel: React.FC<
    MenuMissingIngredientsPanelProps
> = ({ ingredients, allergens }) => {
    const { t } = useTranslation("menu");
    const entries = Object.entries(ingredients);
    const missingCount = entries.filter(
        ([, ingredient]) => !ingredient.sufficient,
    ).length;

    return (
        <aside className={styles["menu-missing-ingredients-panel"]}>
            <div className={styles["menu-missing-ingredients-panel__header"]}>
                <span
                    className={styles["menu-missing-ingredients-panel__title"]}
                >
                    {t("menuDetailsPage.ingredientsPanelTitle")}
                </span>
                {missingCount > 0 && (
                    <span
                        className={
                            styles["menu-missing-ingredients-panel__badge"]
                        }
                    >
                        {missingCount}
                    </span>
                )}
            </div>
            {entries.length === 0 ? (
                <p className={styles["menu-missing-ingredients-panel__empty"]}>
                    {t("menuDetailsPage.noMissingIngredients")}
                </p>
            ) : (
                <>
                    <ul
                        className={
                            styles["menu-missing-ingredients-panel__list"]
                        }
                    >
                        {entries.map(
                            ([
                                id,
                                { slug, name, quantity, unit, sufficient },
                            ]) => (
                                <li
                                    key={id}
                                    className={[
                                        styles[
                                            "menu-missing-ingredients-panel__row"
                                        ],
                                        !sufficient &&
                                            styles[
                                                "menu-missing-ingredients-panel__row--missing"
                                            ],
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}
                                >
                                    {sufficient ? (
                                        <Check
                                            size={CHECK_ICON_SIZE}
                                            aria-label={t(
                                                "menuDetailsPage.haveEnough",
                                            )}
                                            className={
                                                styles[
                                                    "menu-missing-ingredients-panel__check"
                                                ]
                                            }
                                        />
                                    ) : (
                                        <span
                                            aria-hidden="true"
                                            className={
                                                styles[
                                                    "menu-missing-ingredients-panel__missing-dot"
                                                ]
                                            }
                                        />
                                    )}
                                    <span
                                        className={
                                            styles[
                                                "menu-missing-ingredients-panel__name"
                                            ]
                                        }
                                    >
                                        {resolveIngredientName({
                                            slug,
                                            name,
                                        })}
                                    </span>
                                    <span
                                        className={
                                            styles[
                                                "menu-missing-ingredients-panel__qty"
                                            ]
                                        }
                                    >
                                        {quantity} {resolveUnit(unit)}
                                    </span>
                                </li>
                            ),
                        )}
                    </ul>
                    <Link
                        to={ROUTES.ingredients}
                        className={
                            styles["menu-missing-ingredients-panel__add"]
                        }
                    >
                        <BasketAddMark size={BUTTON_ICON_SIZE} />
                        {t("menuDetailsPage.goToPantry")}
                    </Link>
                </>
            )}
            <MenuAllergens allergens={allergens} />
        </aside>
    );
};
