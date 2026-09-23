import { Flame } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import styles from "./ProfileDietaryTab.module.scss";

const EMPTY_ICON_SIZE = 40;

// what the tab says before a calorie goal is set, above the goal form
export const DietaryEmptyIntro: React.FC = () => {
    const { t } = useTranslation("calories");

    return (
        <div className={styles["profile-dietary-tab__empty-intro"]}>
            <span className={styles["profile-dietary-tab__empty-icon"]}>
                <Flame size={EMPTY_ICON_SIZE} aria-hidden="true" />
            </span>
            <h2 className={styles["profile-dietary-tab__empty-title"]}>
                {t("dietaryTab.emptyTitle")}
            </h2>
            <p className={styles["profile-dietary-tab__empty-description"]}>
                {t("dietaryTab.emptyDescription")}
            </p>
        </div>
    );
};
