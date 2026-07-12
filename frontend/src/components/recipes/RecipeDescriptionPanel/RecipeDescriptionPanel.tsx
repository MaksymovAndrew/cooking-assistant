import React from "react";
import { useTranslation } from "react-i18next";

import styles from "./RecipeDescriptionPanel.module.scss";

interface RecipeDescriptionPanelProps {
    content: string;
    allergens: string[];
}

export const RecipeDescriptionPanel: React.FC<RecipeDescriptionPanelProps> = ({
    content,
    allergens,
}) => {
    const { t } = useTranslation("recipes");

    return (
        <div className={styles["recipe-description-panel"]}>
            <span className={styles["recipe-description-panel__label"]}>
                {t("recipeDetailsPage.description")}
            </span>
            <p className={styles["recipe-description-panel__content"]}>
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
                        {allergens.map((allergen) => (
                            <span
                                key={allergen}
                                className={
                                    styles["recipe-description-panel__allergen"]
                                }
                            >
                                {allergen}
                            </span>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
