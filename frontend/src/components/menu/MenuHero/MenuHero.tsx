import { Flame, Star } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { MENU_RATING, MENU_RATING_COUNT } from "constants/ratings";
import type { MenuDetails } from "types/menu";

import { useAppSelector } from "redux/hooks";
import { selectViewerCapabilities } from "redux/selectors/viewerSelectors";

import { MenuHeroStats } from "components/menu/MenuHero/MenuHeroStats";
import { MenuHeroVisitorActions } from "components/menu/MenuHero/MenuHeroVisitorActions";
import { MenuHeroActions } from "components/menu/MenuHeroActions";
import { Button } from "components/ui/Button";
import { Chip } from "components/ui/Chip";

import { formatKcal } from "utils/calories";
import { splitCookingTime } from "utils/cookingTimeUtils";

import styles from "./MenuHero.module.scss";

interface MenuHeroProps {
    menu: MenuDetails["menu"];
    totalCookingTime: number;
    recipeCount: number;
    caloriesPerPortion: number | null;
    editTo: string;
    onDelete: () => void;
    onLogIntake?: () => void;
    exceedsBudget?: boolean;
}

const STAT_ICON_SIZE = 16;
const RATING_ICON_SIZE = 13;

export const MenuHero: React.FC<MenuHeroProps> = ({
    menu,
    totalCookingTime,
    recipeCount,
    caloriesPerPortion,
    editTo,
    onDelete,
    onLogIntake,
    exceedsBudget = false,
}) => {
    const { t } = useTranslation("menu");
    const { canFavourite } = useAppSelector(selectViewerCapabilities);
    const favouriteLabel = t("menuDetailsPage.favourite");
    const logIntakeLabel = t("menuDetailsPage.logIntake");
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
                {menu.isOwner && (
                    <MenuHeroActions
                        editTo={editTo}
                        onDelete={onDelete}
                        editLabel={t("menuDetailsPage.editButton")}
                        deleteLabel={t("menuDetailsPage.deleteButton")}
                        favouriteLabel={favouriteLabel}
                        onLogIntake={onLogIntake}
                        logIntakeLabel={logIntakeLabel}
                    />
                )}
            </div>

            {menu.menucontent && (
                <p className={styles["menu-hero__description"]}>
                    {menu.menucontent}
                </p>
            )}

            {!menu.isOwner && (
                <MenuHeroVisitorActions
                    canFavourite={canFavourite}
                    favouriteLabel={favouriteLabel}
                    logIntakeLabel={logIntakeLabel}
                    onLogIntake={onLogIntake}
                />
            )}

            <MenuHeroStats
                formattedTotalTime={formattedTotalTime}
                recipeCount={recipeCount}
                formattedCalories={formattedCalories}
                isOwner={menu.isOwner}
                exceedsBudget={exceedsBudget}
            />

            {menu.isOwner && onLogIntake && (
                <Button
                    variant="secondary"
                    className={styles["menu-hero__owner-log-intake-mobile"]}
                    onClick={onLogIntake}
                >
                    <Flame size={STAT_ICON_SIZE} aria-hidden="true" />
                    {logIntakeLabel}
                </Button>
            )}
        </div>
    );
};
