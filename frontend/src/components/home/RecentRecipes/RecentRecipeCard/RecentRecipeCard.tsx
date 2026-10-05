import { Flame } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { HOME_DURATION_COPY } from "constants/durationCopy";
import { recipeDetailsPath } from "constants/routes";
import type { RecipeSearchResultItem } from "types/recipe";

import { useLocale } from "hooks/useLocale";

import { DonburiMarkCompact } from "components/icons";
import { Link } from "components/ui/Link";
import { RatingSummary } from "components/ui/RatingSummary";
import { RecordPhoto } from "components/ui/RecordPhoto";

import { formatKcal, roundCalories } from "utils/calories";
import { formatDuration } from "utils/cookingTimeUtils";
import { cx } from "utils/cx";
import { mediaUrl } from "utils/mediaUrl";

import styles from "./RecentRecipeCard.module.scss";

interface RecentRecipeCardProps {
    recipe: RecipeSearchResultItem;
    exceedsBudget?: boolean;
}

const IMAGE_ICON_SIZE = 22;
const STAR_ICON_SIZE = 11;

export const RecentRecipeCard: React.FC<RecentRecipeCardProps> = ({
    recipe,
    exceedsBudget = false,
}) => {
    const { t } = useTranslation("home");
    const locale = useLocale();
    const timeLabel = formatDuration(
        t,
        recipe.cooking_time,
        HOME_DURATION_COPY,
    );
    const caloriesClassName = cx(
        styles["recent-recipe-card__calories"],
        exceedsBudget && styles["recent-recipe-card__calories--over"],
    );

    return (
        <Link
            href={recipeDetailsPath(recipe.id)}
            className={styles["recent-recipe-card"]}
        >
            <div
                className={styles["recent-recipe-card__image"]}
                aria-hidden="true"
            >
                <RecordPhoto
                    src={mediaUrl(recipe.photo_key, "card")}
                    fallback={
                        <DonburiMarkCompact
                            size={IMAGE_ICON_SIZE}
                            className={styles["recent-recipe-card__image-icon"]}
                        />
                    }
                />
            </div>
            <div className={styles["recent-recipe-card__body"]}>
                <div className={styles["recent-recipe-card__title"]}>
                    {recipe.title}
                </div>
                <div className={styles["recent-recipe-card__meta"]}>
                    <span>{timeLabel}</span>
                    {recipe.calories_per_portion !== null && (
                        <span
                            className={caloriesClassName}
                            title={
                                exceedsBudget
                                    ? t("common:contentCard.overBudgetTooltip")
                                    : undefined
                            }
                        >
                            <Flame size={STAR_ICON_SIZE} aria-hidden="true" />
                            {t("recentRecipes.caloriesValue", {
                                count: formatKcal(
                                    roundCalories(recipe.calories_per_portion),
                                    locale,
                                ),
                            })}
                        </span>
                    )}
                    <RatingSummary
                        average={recipe.ratingAverage}
                        count={recipe.ratingCount}
                        iconSize={STAR_ICON_SIZE}
                        className={styles["recent-recipe-card__rating"]}
                        showCount={false}
                        hideWhenEmpty
                    />
                </div>
            </div>
        </Link>
    );
};
