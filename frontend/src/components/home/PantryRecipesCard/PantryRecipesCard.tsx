import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { BasketMark } from "components/icons";
import { LinkButton } from "components/ui/LinkButton";

import { BOOLEAN_URL_TRUE } from "utils/filters/filterDefFactories.scalar";
import { RECIPE_PANTRY_URL_PARAM } from "utils/filters/recipeFilterDefs";

import styles from "./PantryRecipesCard.module.scss";

const ICON_SIZE = 20;
const PANTRY_LINK = `${ROUTES.allRecipes}?${RECIPE_PANTRY_URL_PARAM}=${BOOLEAN_URL_TRUE}`;

// the CTA links straight to the recipe list with the "in my pantry" filter already
// set in the URL, so the list opens already filtered
export const PantryRecipesCard: React.FC = () => {
    const { t } = useTranslation("home");

    return (
        <section className={styles["pantry-recipes-card"]}>
            <span className={styles["pantry-recipes-card__icon"]}>
                <BasketMark size={ICON_SIZE} aria-hidden="true" />
            </span>
            <div className={styles["pantry-recipes-card__body"]}>
                <span className={styles["pantry-recipes-card__title"]}>
                    {t("pantryRecipes.title")}
                </span>
                <p className={styles["pantry-recipes-card__description"]}>
                    {t("pantryRecipes.description")}
                </p>
            </div>
            <LinkButton
                to={PANTRY_LINK}
                variant="secondary"
                className={styles["pantry-recipes-card__cta"]}
            >
                {t("pantryRecipes.cta")}
            </LinkButton>
        </section>
    );
};
