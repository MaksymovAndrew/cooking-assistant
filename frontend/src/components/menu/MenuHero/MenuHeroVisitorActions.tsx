import { Flame, Heart, Sparkles } from "lucide-react";
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
    favouriteLabel: string;
    logIntakeLabel: string;
    onLogIntake?: () => void;
}

const FAVOURITE_ICON_SIZE = 17;
const STAT_ICON_SIZE = 16;

// non-owner branch of MenuHero; a guest gets one generic login CTA instead of a per-feature one
export const MenuHeroVisitorActions: React.FC<MenuHeroVisitorActionsProps> = ({
    canFavourite,
    favouriteLabel,
    logIntakeLabel,
    onLogIntake,
}) => {
    const { t } = useTranslation("menu");
    const location = useLocation();
    const loginState: LoginRedirectState = { from: location };

    if (!canFavourite) {
        return (
            <div className={styles["menu-hero__visitor-actions"]}>
                <LinkButton
                    to={ROUTES.login}
                    state={loginState}
                    variant="secondary"
                    className={styles["menu-hero__visitor-log-intake"]}
                >
                    <Sparkles size={STAT_ICON_SIZE} aria-hidden="true" />
                    {t("menuDetailsPage.guestCta")}
                </LinkButton>
            </div>
        );
    }

    return (
        <div className={styles["menu-hero__visitor-actions"]}>
            <button
                type="button"
                disabled
                aria-label={favouriteLabel}
                className={styles["menu-hero__favourite"]}
            >
                <Heart size={FAVOURITE_ICON_SIZE} aria-hidden="true" />
                {favouriteLabel}
            </button>
            {onLogIntake && (
                <Button
                    variant="secondary"
                    className={styles["menu-hero__visitor-log-intake"]}
                    onClick={onLogIntake}
                >
                    <Flame size={STAT_ICON_SIZE} aria-hidden="true" />
                    {logIntakeLabel}
                </Button>
            )}
        </div>
    );
};
