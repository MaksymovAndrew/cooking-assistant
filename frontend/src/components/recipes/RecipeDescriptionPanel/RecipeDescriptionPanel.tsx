import { Ban } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { Locale } from "constants/locales";

import { useAvoidedIngredients } from "hooks/useAvoidedIngredients";

import { resolveAllergen } from "utils/ingredientName";

import styles from "./RecipeDescriptionPanel.module.scss";

const ALLERGEN_ICON_SIZE = 11;

interface RecipeDescriptionPanelProps {
    content: string;
    // the language the author wrote the steps in, for screen readers and hyphenation
    language: Locale;
    allergens: string[];
}

export const RecipeDescriptionPanel: React.FC<RecipeDescriptionPanelProps> = ({
    content,
    language,
    allergens,
}) => {
    const { t } = useTranslation("recipes");
    const { isAllergenAvoided } = useAvoidedIngredients();

    return (
        <div className={styles["recipe-description-panel"]}>
            <span className={styles["recipe-description-panel__label"]}>
                {t("recipeDetailsPage.description")}
            </span>
            <p
                className={styles["recipe-description-panel__content"]}
                lang={language}
            >
                {content}
            </p>
            {allergens.length > 0 && (
                <>
                    <div
                        className={
                            styles["recipe-description-panel__allergens-head"]
                        }
                    >
                        <span
                            className={styles["recipe-description-panel__dot"]}
                        />
                        <span
                            className={
                                styles["recipe-description-panel__label"]
                            }
                        >
                            {t("recipeDetailsPage.allergens")}
                        </span>
                    </div>
                    <div
                        className={
                            styles["recipe-description-panel__allergens"]
                        }
                    >
                        {allergens.map((allergen) => {
                            const isAvoided = isAllergenAvoided(allergen);

                            return (
                                <span
                                    key={allergen}
                                    className={[
                                        styles[
                                            "recipe-description-panel__allergen"
                                        ],
                                        isAvoided &&
                                            styles[
                                                "recipe-description-panel__allergen--avoided"
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
                                                    "recipe-description-panel__sr-only"
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
                </>
            )}
        </div>
    );
};
