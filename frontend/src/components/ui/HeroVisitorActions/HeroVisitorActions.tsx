import { ChefHat, Flame, Sparkles } from "lucide-react";
import React from "react";

import { ROUTES } from "constants/routes";

import type { FavouriteToggle } from "hooks/useFavouriteToggle";

import { Button } from "components/ui/Button";
import { FavouriteButton } from "components/ui/FavouriteButton";
import { LinkButton } from "components/ui/LinkButton";
import { ShareButton } from "components/ui/ShareButton";

import { cx } from "utils/cx";
import { rememberLoginRedirect } from "utils/loginRedirect";

import styles from "./HeroVisitorActions.module.scss";

interface HeroVisitorActionsProps {
    // null for a guest; read off the server-rendered record, not the session, so the CTA never flashes
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
                    className={cx(
                        styles["hero-visitor-actions__wide"],
                        styles["hero-visitor-actions__wide--shared"],
                    )}
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
            <FavouriteButton
                favourite={favourite}
                label={favouriteLabel}
                iconSize={ICON_SIZE}
                className={styles["hero-visitor-actions__favourite"]}
            >
                {favouriteLabel}
            </FavouriteButton>
            <ShareButton title={shareTitle} iconSize={ICON_SIZE} />
        </div>
    );
};
