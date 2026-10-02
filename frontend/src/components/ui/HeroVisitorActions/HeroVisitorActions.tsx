import { ChefHat, Flame, Sparkles } from "lucide-react";
import React from "react";

import { ROUTES } from "constants/routes";

import type { FavouriteToggle } from "hooks/useFavouriteToggle";

import { Button } from "components/ui/Button";
import { FavouriteButton } from "components/ui/FavouriteButton";
import { LinkButton } from "components/ui/LinkButton";
import { ShareButton } from "components/ui/ShareButton";

import { rememberLoginRedirect } from "utils/loginRedirect";

import styles from "./HeroVisitorActions.module.scss";

interface HeroVisitorActionsProps {
    // null for an anonymous viewer - the caller reads it off the server-rendered record, not the client
    // session, so the page never flashes the guest CTA at someone who is signed in
    favourite: FavouriteToggle | null;
    favouriteLabel: string;
    shareTitle: string;
    guestCtaLabel: string;
    logIntakeLabel: string;
    onLogIntake?: () => void;
    cookLabel?: string;
    onCook?: () => void;
}

const ICON_SIZE = 20;

// non-owner branch of RecipeHero/MenuHero's action row; copy is caller-provided to stay domain-agnostic
export const HeroVisitorActions: React.FC<HeroVisitorActionsProps> = ({
    favourite,
    favouriteLabel,
    shareTitle,
    guestCtaLabel,
    logIntakeLabel,
    onLogIntake,
    cookLabel,
    onCook,
}) => {
    if (favourite === null) {
        return (
            <div className={styles["hero-visitor-actions"]}>
                <LinkButton
                    href={ROUTES.login}
                    onClick={rememberLoginRedirect}
                    variant="secondary"
                    className={styles["hero-visitor-actions__wide"]}
                >
                    <Sparkles size={ICON_SIZE} aria-hidden="true" />
                    {guestCtaLabel}
                </LinkButton>
                <ShareButton title={shareTitle} iconSize={ICON_SIZE} />
            </div>
        );
    }

    return (
        <div className={styles["hero-visitor-actions"]}>
            <FavouriteButton
                favourite={favourite}
                label={favouriteLabel}
                iconSize={ICON_SIZE}
                className={styles["hero-visitor-actions__favourite"]}
            >
                {favouriteLabel}
            </FavouriteButton>
            {onCook && (
                <Button
                    variant="secondary"
                    className={styles["hero-visitor-actions__wide"]}
                    onClick={onCook}
                >
                    <ChefHat size={ICON_SIZE} aria-hidden="true" />
                    {cookLabel}
                </Button>
            )}
            {onLogIntake && (
                <Button
                    variant="secondary"
                    className={styles["hero-visitor-actions__wide"]}
                    onClick={onLogIntake}
                >
                    <Flame size={ICON_SIZE} aria-hidden="true" />
                    {logIntakeLabel}
                </Button>
            )}
            <ShareButton title={shareTitle} iconSize={ICON_SIZE} />
        </div>
    );
};
