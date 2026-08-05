import { Flame, Heart } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { Button } from "components/ui/Button";
import { LinkButton } from "components/ui/LinkButton";

import type { LoginRedirectState } from "utils/loginRedirect";

import styles from "./MenuHero.module.scss";

interface MenuHeroVisitorActionsProps {
    canFavourite: boolean;
    canTrackCalories: boolean;
    favouriteLabel: string;
    logIntakeLabel: string;
    onLogIntake?: () => void;
}

const FAVOURITE_ICON_SIZE = 17;
const STAT_ICON_SIZE = 16;

// the non-owner branch of MenuHero - split out to keep MenuHero under the components/ max-lines cap
export const MenuHeroVisitorActions: React.FC<MenuHeroVisitorActionsProps> = ({
    canFavourite,
    canTrackCalories,
    favouriteLabel,
    logIntakeLabel,
    onLogIntake,
}) => {
    const { t } = useTranslation("menu");
    const location = useLocation();
    const loginState: LoginRedirectState = { from: location };

    return (
        <div className={styles["menu-hero__visitor-actions"]}>
            {canFavourite && (
                <button
                    type="button"
                    disabled
                    aria-label={favouriteLabel}
                    className={styles["menu-hero__favourite"]}
                >
                    <Heart size={FAVOURITE_ICON_SIZE} aria-hidden="true" />
                    {favouriteLabel}
                </button>
            )}
            {onLogIntake &&
                (canTrackCalories ? (
                    <Button
                        variant="secondary"
                        className={styles["menu-hero__visitor-log-intake"]}
                        onClick={onLogIntake}
                    >
                        <Flame size={STAT_ICON_SIZE} aria-hidden="true" />
                        {logIntakeLabel}
                    </Button>
                ) : (
                    <LinkButton
                        to={ROUTES.login}
                        state={loginState}
                        variant="secondary"
                        className={styles["menu-hero__visitor-log-intake"]}
                    >
                        <Flame size={STAT_ICON_SIZE} aria-hidden="true" />
                        {t("menuDetailsPage.logIntakeCta")}
                    </LinkButton>
                ))}
        </div>
    );
};
