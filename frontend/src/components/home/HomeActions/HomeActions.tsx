import { Bell, Plus } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { Button } from "components/ui/Button";
import { LinkButton } from "components/ui/LinkButton";

import styles from "./HomeActions.module.scss";

interface HomeActionsProps {
    onOpenNews: () => void;
    hasUnseenNews: boolean;
}

const BELL_ICON_SIZE = 18;
const PLUS_ICON_SIZE = 15;

// the mobile/tablet action row from the mockup - on desktop these actions
// live in the greeting header instead and this row is hidden via CSS
export const HomeActions: React.FC<HomeActionsProps> = ({
    onOpenNews,
    hasUnseenNews,
}) => {
    const { t } = useTranslation("home");

    return (
        <div className={styles["home-actions"]}>
            <Button
                variant="secondary"
                iconOnly
                onClick={onOpenNews}
                aria-label={t("actions.news")}
                className={styles["home-actions__news"]}
            >
                <Bell size={BELL_ICON_SIZE} aria-hidden="true" />
                {hasUnseenNews && (
                    <span
                        className={styles["home-actions__dot"]}
                        aria-hidden="true"
                    />
                )}
            </Button>
            <LinkButton
                to={ROUTES.addMenu}
                variant="secondary"
                className={styles["home-actions__menu"]}
            >
                {t("actions.newMenu")}
            </LinkButton>
            <LinkButton
                to={ROUTES.addRecipe}
                className={styles["home-actions__recipe"]}
            >
                <Plus size={PLUS_ICON_SIZE} aria-hidden="true" />
                {t("actions.newRecipe")}
            </LinkButton>
        </div>
    );
};
