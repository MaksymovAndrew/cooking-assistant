import { Flame, Heart, Sparkles } from "lucide-react";
import React from "react";
import { useLocation } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { Button } from "components/ui/Button";
import { LinkButton } from "components/ui/LinkButton";

import type { LoginRedirectState } from "utils/loginRedirect";

import styles from "./HeroVisitorActions.module.scss";

interface HeroVisitorActionsProps {
    canFavourite: boolean;
    favouriteLabel: string;
    guestCtaLabel: string;
    logIntakeLabel: string;
    onLogIntake?: () => void;
}

const ICON_SIZE = 20;

// non-owner branch of RecipeHero/MenuHero's action row; copy is caller-provided to stay domain-agnostic
export const HeroVisitorActions: React.FC<HeroVisitorActionsProps> = ({
    canFavourite,
    favouriteLabel,
    guestCtaLabel,
    logIntakeLabel,
    onLogIntake,
}) => {
    const location = useLocation();
    const loginState: LoginRedirectState = { from: location };

    if (!canFavourite) {
        return (
            <div className={styles["hero-visitor-actions"]}>
                <LinkButton
                    to={ROUTES.login}
                    state={loginState}
                    variant="secondary"
                    className={styles["hero-visitor-actions__log-intake"]}
                >
                    <Sparkles size={ICON_SIZE} aria-hidden="true" />
                    {guestCtaLabel}
                </LinkButton>
            </div>
        );
    }

    return (
        <div className={styles["hero-visitor-actions"]}>
            <button
                type="button"
                disabled
                aria-label={favouriteLabel}
                className={styles["hero-visitor-actions__favourite"]}
            >
                <Heart size={ICON_SIZE} aria-hidden="true" />
                {favouriteLabel}
            </button>
            {onLogIntake && (
                <Button
                    variant="secondary"
                    className={styles["hero-visitor-actions__log-intake"]}
                    onClick={onLogIntake}
                >
                    <Flame size={ICON_SIZE} aria-hidden="true" />
                    {logIntakeLabel}
                </Button>
            )}
        </div>
    );
};
