import { Flame, Heart, Sparkles } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { Button } from "components/ui/Button";
import { LinkButton } from "components/ui/LinkButton";

import type { LoginRedirectState } from "utils/loginRedirect";

import styles from "./RecipeHero.module.scss";

interface RecipeHeroVisitorActionsProps {
    canFavourite: boolean;
    favouriteLabel: string;
    onLogIntake?: () => void;
}

const FAVOURITE_ICON_SIZE = 20;

// non-owner branch of RecipeHero; a guest gets one generic login CTA instead of a per-feature one
export const RecipeHeroVisitorActions: React.FC<
    RecipeHeroVisitorActionsProps
> = ({ canFavourite, favouriteLabel, onLogIntake }) => {
    const { t } = useTranslation("recipes");
    const location = useLocation();
    const loginState: LoginRedirectState = { from: location };

    if (!canFavourite) {
        return (
            <div className={styles["recipe-hero__visitor-actions"]}>
                <LinkButton
                    to={ROUTES.login}
                    state={loginState}
                    variant="secondary"
                    className={styles["recipe-hero__visitor-log-intake"]}
                >
                    <Sparkles size={FAVOURITE_ICON_SIZE} aria-hidden="true" />
                    {t("recipeDetailsPage.guestCta")}
                </LinkButton>
            </div>
        );
    }

    return (
        <div className={styles["recipe-hero__visitor-actions"]}>
            <button
                type="button"
                disabled
                aria-label={favouriteLabel}
                className={styles["recipe-hero__visitor-favourite"]}
            >
                <Heart size={FAVOURITE_ICON_SIZE} aria-hidden="true" />
                {favouriteLabel}
            </button>
            {onLogIntake && (
                <Button
                    variant="secondary"
                    className={styles["recipe-hero__visitor-log-intake"]}
                    onClick={onLogIntake}
                >
                    <Flame size={FAVOURITE_ICON_SIZE} aria-hidden="true" />
                    {t("recipeDetailsPage.logIntake")}
                </Button>
            )}
        </div>
    );
};
