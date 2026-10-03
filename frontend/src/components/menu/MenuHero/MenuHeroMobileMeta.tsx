import { Clock, Flame } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { BookMark } from "components/icons";

import { cx } from "utils/cx";

import styles from "./MenuHero.module.scss";

interface MenuHeroMobileMetaProps {
    formattedTotalTime: string;
    recipeCount: number;
    formattedCalories: string | null;
    exceedsBudget: boolean;
}

const META_ICON_SIZE = 16;

export const MenuHeroMobileMeta: React.FC<MenuHeroMobileMetaProps> = ({
    formattedTotalTime,
    recipeCount,
    formattedCalories,
    exceedsBudget,
}) => {
    const { t } = useTranslation("menu");
    const caloriesClassName = cx(
        styles["menu-hero__mobile-meta-item"],
        exceedsBudget && styles["menu-hero__mobile-meta-item--calorie-over"],
    );

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
