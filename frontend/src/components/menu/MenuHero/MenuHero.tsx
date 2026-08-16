import { Star } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { MENU_RATING, MENU_RATING_COUNT } from "constants/ratings";
import type { MenuDetails } from "types/menu";

import { MenuHeroStats } from "components/menu/MenuHero/MenuHeroStats";
import { Chip } from "components/ui/Chip";

import { formatKcal } from "utils/calories";
import { splitCookingTime } from "utils/cookingTimeUtils";

import styles from "./MenuHero.module.scss";

interface MenuHeroProps {
    menu: MenuDetails["menu"];
    totalCookingTime: number;
    recipeCount: number;
    caloriesPerPortion: number | null;
    exceedsBudget?: boolean;
}

const RATING_ICON_SIZE = 13;

// title, meta and description only - actions and the ingredients/recipes grid live in
// MenuDetailsSecondary, which follows this in the page's single title -> meta -> description ->
// ingredients -> actions -> recipes reading order
export const MenuHero: React.FC<MenuHeroProps> = ({
    menu,
    totalCookingTime,
    recipeCount,
    caloriesPerPortion,
    exceedsBudget = false,
}) => {
    const { t } = useTranslation("menu");
    const { hours, minutes } = splitCookingTime(totalCookingTime);
    const formattedTotalTime =
        hours > 0
            ? t("menuDetailsPage.totalTimeHoursMinutes", { hours, minutes })
            : t("menuDetailsPage.totalTimeMinutes", { minutes });
    const formattedCalories =
        caloriesPerPortion === null
            ? null
            : t("menuDetailsPage.caloriesValue", {
                  count: formatKcal(Math.round(caloriesPerPortion)),
              });

    return (
        <div className={styles["menu-hero"]}>
            <div className={styles["menu-hero__header"]}>
                <div className={styles["menu-hero__title-row"]}>
                    <h1 className={styles["menu-hero__title"]}>{menu.title}</h1>
                    <Chip variant="type">{menu.categoryname}</Chip>
                    <span className={styles["menu-hero__rating-inline"]}>
                        <Star
                            size={RATING_ICON_SIZE}
                            aria-hidden="true"
                            className={styles["menu-hero__rating-inline-icon"]}
                        />
                        {MENU_RATING}
                        <span className={styles["menu-hero__stat-count"]}>
                            {MENU_RATING_COUNT}
                        </span>
                    </span>
                </div>
            </div>

            <MenuHeroStats
                formattedTotalTime={formattedTotalTime}
                recipeCount={recipeCount}
                formattedCalories={formattedCalories}
                isOwner={menu.isOwner}
                exceedsBudget={exceedsBudget}
            />

            {menu.menucontent && (
                <p className={styles["menu-hero__description"]}>
                    {menu.menucontent}
                </p>
            )}
        </div>
    );
};
