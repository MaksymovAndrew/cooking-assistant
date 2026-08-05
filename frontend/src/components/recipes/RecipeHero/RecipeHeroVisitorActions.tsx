import { Flame, Heart } from "lucide-react";
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
    canTrackCalories: boolean;
    favouriteLabel: string;
    onLogIntake?: () => void;
}

const FAVOURITE_ICON_SIZE = 20;

// the non-owner branch of RecipeHero - split out to keep RecipeHero under the components/ max-lines cap
export const RecipeHeroVisitorActions: React.FC<
    RecipeHeroVisitorActionsProps
> = ({ canFavourite, canTrackCalories, favouriteLabel, onLogIntake }) => {
    const { t } = useTranslation("recipes");
    const location = useLocation();
    const loginState: LoginRedirectState = { from: location };

    return (
        <div className={styles["recipe-hero__visitor-actions"]}>
            {canFavourite && (
                <button
                    type="button"
                    disabled
                    aria-label={favouriteLabel}
                    className={styles["recipe-hero__visitor-favourite"]}
                >
                    <Heart size={FAVOURITE_ICON_SIZE} aria-hidden="true" />
                    {favouriteLabel}
                </button>
            )}
            {onLogIntake &&
                (canTrackCalories ? (
                    <Button
                        variant="secondary"
                        className={styles["recipe-hero__visitor-log-intake"]}
                        onClick={onLogIntake}
                    >
                        <Flame size={FAVOURITE_ICON_SIZE} aria-hidden="true" />
                        {t("recipeDetailsPage.logIntake")}
                    </Button>
                ) : (
                    <LinkButton
                        to={ROUTES.login}
                        state={loginState}
                        variant="secondary"
                        className={styles["recipe-hero__visitor-log-intake"]}
                    >
                        <Flame size={FAVOURITE_ICON_SIZE} aria-hidden="true" />
                        {t("recipeDetailsPage.logIntakeCta")}
                    </LinkButton>
                ))}
        </div>
    );
};
