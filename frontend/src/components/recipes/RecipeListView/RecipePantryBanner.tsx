import React from "react";
import { useTranslation } from "react-i18next";

import styles from "./RecipeListView.module.scss";

interface RecipePantryBannerProps {
    total: number;
}

export const RecipePantryBanner: React.FC<RecipePantryBannerProps> = ({
    total,
}) => {
    const { t } = useTranslation("recipes");

    return (
        <p className={styles["recipe-list-view__pantry-banner"]}>
            {t("filterPanel.pantryBanner", { count: total })}
        </p>
    );
};
