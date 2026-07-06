import { Check } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { IngredientAvailability } from "hooks/useIngredientAvailability";

import styles from "./RecipeIngredientsPanel.module.scss";

interface RecipeIngredientsPanelProps {
    availability: IngredientAvailability[];
    haveCount: number;
    missingCount: number;
    canScale: boolean;
    servingsCount: number | null;
    scaleFactor: number;
    onIncrement: () => void;
    onDecrement: () => void;
}

const CHECK_ICON_SIZE = 16;
const DECIMALS = 2;

const scaleQuantity = (quantity: number, scaleFactor: number) =>
    Number((quantity * scaleFactor).toFixed(DECIMALS));

export const RecipeIngredientsPanel: React.FC<RecipeIngredientsPanelProps> = ({
    availability,
    haveCount,
    missingCount,
    canScale,
    servingsCount,
    scaleFactor,
    onIncrement,
    onDecrement,
}) => {
    const { t } = useTranslation("recipes");
    const sorted = [...availability].sort((a, b) =>
        a.name.localeCompare(b.name),
    );

    return (
        <div className={styles["recipe-ingredients-panel"]}>
            <div className={styles["recipe-ingredients-panel__header"]}>
                <div>
                    <div className={styles["recipe-ingredients-panel__title"]}>
                        {t("recipeDetailsPage.ingredients")}
                    </div>
                    <div
                        className={styles["recipe-ingredients-panel__caption"]}
                    >
                        {t("recipeDetailsPage.ingredientsCaption", {
                            count: availability.length,
                        })}
                    </div>
                </div>
                {canScale && (
                    <div
                        className={styles["recipe-ingredients-panel__stepper"]}
                    >
                        <button
                            type="button"
                            aria-label={t("recipeDetailsPage.fewerPortions")}
                            onClick={onDecrement}
                        >
                            −
                        </button>
                        <span>{servingsCount}</span>
                        <button
                            type="button"
                            aria-label={t("recipeDetailsPage.morePortions")}
                            onClick={onIncrement}
                        >
                            +
                        </button>
                    </div>
                )}
            </div>

            <ul className={styles["recipe-ingredients-panel__list"]}>
                {sorted.map((ingredient) => (
                    <li
                        key={ingredient.id}
                        className={[
                            styles["recipe-ingredients-panel__row"],
                            !ingredient.have &&
                                styles[
                                    "recipe-ingredients-panel__row--missing"
                                ],
                        ]
                            .filter(Boolean)
                            .join(" ")}
                    >
                        {ingredient.have ? (
                            <Check
                                size={CHECK_ICON_SIZE}
                                aria-hidden="true"
                                className={
                                    styles[
                                        "recipe-ingredients-panel__have-icon"
                                    ]
                                }
                            />
                        ) : (
                            <span
                                aria-hidden="true"
                                className={
                                    styles[
                                        "recipe-ingredients-panel__missing-dot"
                                    ]
                                }
                            />
                        )}
                        <span
                            className={styles["recipe-ingredients-panel__name"]}
                        >
                            {ingredient.name}
                        </span>
                        <span
                            className={styles["recipe-ingredients-panel__qty"]}
                        >
                            {scaleQuantity(
                                ingredient.quantity_recipe_ingredients,
                                scaleFactor,
                            )}{" "}
                            {ingredient.unit_name}
                        </span>
                    </li>
                ))}
            </ul>

            <div className={styles["recipe-ingredients-panel__banner"]}>
                <span
                    className={styles["recipe-ingredients-panel__banner-dot"]}
                    aria-hidden="true"
                />
                <div>
                    <div
                        className={
                            styles["recipe-ingredients-panel__banner-title"]
                        }
                    >
                        {t("recipeDetailsPage.missingIngredients")}
                    </div>
                    <div
                        className={
                            styles["recipe-ingredients-panel__banner-text"]
                        }
                    >
                        {t("recipeDetailsPage.haveOfTotal", {
                            have: haveCount,
                            total: availability.length,
                        })}{" "}
                        {t("recipeDetailsPage.toBuy", { count: missingCount })}
                    </div>
                </div>
            </div>
        </div>
    );
};
