import { Clock, Flame } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { BookMark } from "components/icons";

import styles from "./MenuHero.module.scss";

interface MenuHeroMobileMetaProps {
    formattedTotalTime: string;
    recipeCount: number;
    formattedCalories: string | null;
    exceedsBudget: boolean;
}

const META_ICON_SIZE = 16;

// the phone layout's one-line summary, standing in for the stat blocks
export const MenuHeroMobileMeta: React.FC<MenuHeroMobileMetaProps> = ({
    formattedTotalTime,
    recipeCount,
    formattedCalories,
    exceedsBudget,
}) => {
    const { t } = useTranslation("menu");
    const caloriesClassName = [
        styles["menu-hero__mobile-meta-item"],
        exceedsBudget && styles["menu-hero__mobile-meta-item--calorie-over"],
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={styles["menu-hero__mobile-meta"]}>
            <span className={styles["menu-hero__mobile-meta-item"]}>
                <Clock size={META_ICON_SIZE} aria-hidden="true" />
                {formattedTotalTime}
            </span>
            <span className={styles["menu-hero__mobile-meta-item"]}>
                <BookMark size={META_ICON_SIZE} />
                {t("menuDetailsPage.recipesCaption", { count: recipeCount })}
            </span>
            {formattedCalories !== null && (
                <span
                    className={caloriesClassName}
                    title={
                        exceedsBudget
                            ? t("common:contentCard.overBudgetTooltip")
                            : undefined
                    }
                >
                    <Flame size={META_ICON_SIZE} aria-hidden="true" />
                    {formattedCalories}
                </span>
            )}
        </div>
    );
};
