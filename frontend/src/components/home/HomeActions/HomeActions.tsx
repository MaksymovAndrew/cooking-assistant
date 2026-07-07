import { Bell, Plus } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { NEW_NEWS_COUNT } from "constants/news";
import { ROUTES } from "constants/routes";

import styles from "./HomeActions.module.scss";

interface HomeActionsProps {
    onOpenNews: () => void;
}

const BELL_ICON_SIZE = 18;
const PLUS_ICON_SIZE = 15;

// the mobile/tablet action row from the mockup - on desktop these actions
// live in the greeting header instead and this row is hidden via CSS
export const HomeActions: React.FC<HomeActionsProps> = ({ onOpenNews }) => {
    const { t } = useTranslation("home");

    return (
        <div className={styles["home-actions"]}>
            <button
                type="button"
                onClick={onOpenNews}
                aria-label={t("actions.news")}
                className={styles["home-actions__news"]}
            >
                <Bell size={BELL_ICON_SIZE} aria-hidden="true" />
                {NEW_NEWS_COUNT > 0 && (
                    <span
                        className={styles["home-actions__dot"]}
                        aria-hidden="true"
                    />
                )}
            </button>
            <Link to={ROUTES.addMenu} className={styles["home-actions__menu"]}>
                {t("actions.newMenu")}
            </Link>
            <Link
                to={ROUTES.addRecipe}
                className={styles["home-actions__recipe"]}
            >
                <Plus size={PLUS_ICON_SIZE} aria-hidden="true" />
                {t("actions.newRecipe")}
            </Link>
        </div>
    );
};
