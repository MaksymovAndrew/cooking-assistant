import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { BasketMark } from "components/icons";
import { LinkButton } from "components/ui/LinkButton";

import { BOOLEAN_URL_TRUE } from "utils/filters/filterDefFactories.scalar";
import { RECIPE_PANTRY_URL_PARAM } from "utils/filters/recipeFilterDefs.toggles";
import {
    getPantryRecipesCardState,
    type PantryRecipesCardState,
} from "utils/pantryRecipesCard";

import styles from "./PantryRecipesCard.module.scss";

const ICON_SIZE = 20;
const PANTRY_LINK = `${ROUTES.allRecipes}?${RECIPE_PANTRY_URL_PARAM}=${BOOLEAN_URL_TRUE}`;

const CTA_HREF: Record<PantryRecipesCardState, string> = {
    "empty-pantry": ROUTES.ingredients,
    counting: PANTRY_LINK,
    none: ROUTES.allRecipes,
    ready: PANTRY_LINK,
};

const CTA_KEY: Record<PantryRecipesCardState, string> = {
    "empty-pantry": "pantryRecipes.emptyPantryCta",
    counting: "pantryRecipes.cta",
    none: "pantryRecipes.browseCta",
    ready: "pantryRecipes.cta",
};

interface PantryRecipesCardProps {
    pantryCount: number;
    // null while the count is still on its way
    cookableCount: number | null;
}

export const PantryRecipesCard: React.FC<PantryRecipesCardProps> = ({
    pantryCount,
    cookableCount,
}) => {
    const { t } = useTranslation("home");
    const state = getPantryRecipesCardState(pantryCount, cookableCount);
    const description: Record<PantryRecipesCardState, string> = {
        "empty-pantry": t("pantryRecipes.emptyPantry"),
        counting: t("pantryRecipes.description"),
        none: t("pantryRecipes.none"),
        ready: t("pantryRecipes.ready", { count: cookableCount ?? 0 }),
    };

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
                    {description[state]}
                </p>
            </div>
            <LinkButton
                href={CTA_HREF[state]}
                variant="secondary"
                className={styles["pantry-recipes-card__cta"]}
            >
                {t(CTA_KEY[state])}
            </LinkButton>
        </section>
    );
};
