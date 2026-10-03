import { Calendar, Clock, Flame } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { RecordRating } from "types/rating";

import { BookMark } from "components/icons";
import { RatingStars } from "components/ui/RatingStars";

import { cx } from "utils/cx";

import styles from "./MenuHero.module.scss";
import { MenuHeroMobileMeta } from "./MenuHeroMobileMeta";

interface MenuHeroStatsProps {
    formattedTotalTime: string;
    recipeCount: number;
    formattedCalories: string | null;
    formattedDate: string;
    rating: RecordRating;
    exceedsBudget?: boolean;
}

const STAT_ICON_SIZE = 16;
const SECONDARY_STAT_CLASS = `${styles["menu-hero__stat"]} ${styles["menu-hero__stat--secondary"]}`;

export const MenuHeroStats: React.FC<MenuHeroStatsProps> = ({
    formattedTotalTime,
    recipeCount,
    formattedCalories,
    formattedDate,
    rating,
    exceedsBudget = false,
}) => {
    const { t } = useTranslation("menu");
    const caloriesOverTooltip = exceedsBudget
        ? t("common:contentCard.overBudgetTooltip")
        : undefined;
    const caloriesStatClassName = cx(
        styles["menu-hero__stat"],
        exceedsBudget && styles["menu-hero__stat--calorie-over"],
    );

    return (
        <>
            <div className={styles["menu-hero__stats"]}>
                <div className={styles["menu-hero__stat"]}>
                    <span className={styles["menu-hero__stat-label"]}>
                        {t("menuDetailsPage.totalTime")}
                    </span>
                    <span className={styles["menu-hero__stat-value"]}>
                        <Clock size={STAT_ICON_SIZE} aria-hidden="true" />
                        {formattedTotalTime}
                    </span>
                </div>
                <div className={SECONDARY_STAT_CLASS}>
                    <span className={styles["menu-hero__stat-label"]}>
                        {t("menuDetailsPage.creationDate")}
                    </span>
                    <span className={styles["menu-hero__stat-value"]}>
                        <Calendar size={STAT_ICON_SIZE} aria-hidden="true" />
                        {formattedDate}
                    </span>
                </div>
                <div className={SECONDARY_STAT_CLASS}>
                    <span className={styles["menu-hero__stat-label"]}>
                        {t("menuDetailsPage.rating")}
                    </span>
                    <RatingStars
                        average={rating.ratingAverage}
                        count={rating.ratingCount}
                    />
                </div>
                <div className={styles["menu-hero__stat"]}>
                    <span className={styles["menu-hero__stat-label"]}>
                        {t("menuDetailsPage.recipes")}
                    </span>
                    <span className={styles["menu-hero__stat-value"]}>
                        <BookMark size={STAT_ICON_SIZE} />
                        {recipeCount}
                    </span>
                </div>
                {formattedCalories !== null && (
                    <div
                        className={caloriesStatClassName}
                        title={caloriesOverTooltip}
                    >
                        <span className={styles["menu-hero__stat-label"]}>
                            {t("menuDetailsPage.calories")}
                        </span>
                        <span className={styles["menu-hero__stat-value"]}>
                            <Flame size={STAT_ICON_SIZE} aria-hidden="true" />
                            {formattedCalories}
                        </span>
                    </div>
                )}
            </div>

            <MenuHeroMobileMeta
                formattedTotalTime={formattedTotalTime}
                recipeCount={recipeCount}
                formattedCalories={formattedCalories}
                exceedsBudget={exceedsBudget}
            />
        </>
    );
};
