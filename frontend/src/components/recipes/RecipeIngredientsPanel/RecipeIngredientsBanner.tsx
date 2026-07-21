import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ROUTES } from "constants/routes";

import styles from "./RecipeIngredientsPanel.module.scss";

interface RecipeIngredientsBannerProps {
    isOwner: boolean;
    haveCount: number;
    totalCount: number;
    missingCount: number;
}

export const RecipeIngredientsBanner: React.FC<
    RecipeIngredientsBannerProps
> = ({ isOwner, haveCount, totalCount, missingCount }) => {
    const { t } = useTranslation("recipes");

    return (
        <div className={styles["recipe-ingredients-panel__banner"]}>
            <span
                className={styles["recipe-ingredients-panel__banner-dot"]}
                aria-hidden="true"
            />
            <div>
                <div
                    className={styles["recipe-ingredients-panel__banner-title"]}
                >
                    {t("recipeDetailsPage.missingIngredients")}
                </div>
                <div
                    className={styles["recipe-ingredients-panel__banner-text"]}
                >
                    {isOwner
                        ? t("recipeDetailsPage.haveOfTotalToBuy", {
                              have: haveCount,
                              total: totalCount,
                              count: missingCount,
                          })
                        : t("recipeDetailsPage.haveOfTotalVisitor", {
                              have: haveCount,
                              total: totalCount,
                          })}{" "}
                    <Link
                        to={ROUTES.ingredients}
                        className={
                            styles["recipe-ingredients-panel__banner-link"]
                        }
                    >
                        {t("recipeDetailsPage.checkPantry")}
                    </Link>
                </div>
            </div>
        </div>
    );
};
