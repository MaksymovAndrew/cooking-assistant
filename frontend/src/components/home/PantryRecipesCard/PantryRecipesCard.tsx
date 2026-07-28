import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { useAppDispatch } from "redux/hooks";
import { setRecipeInPantry } from "redux/slices/filtersSlice";

import { BasketMark } from "components/icons";
import { LinkButton } from "components/ui/LinkButton";

import styles from "./PantryRecipesCard.module.scss";

const ICON_SIZE = 20;

// clicking the CTA turns on the recipe list's "in my pantry" filter before navigating there, so the list opens already filtered
export const PantryRecipesCard: React.FC = () => {
    const { t } = useTranslation("home");
    const dispatch = useAppDispatch();

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
                to={ROUTES.allRecipes}
                variant="secondary"
                onClick={() => {
                    dispatch(setRecipeInPantry(true));
                }}
                className={styles["pantry-recipes-card__cta"]}
            >
                {t("pantryRecipes.cta")}
            </LinkButton>
        </section>
    );
};
