import { Star } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { RATING_VALUES } from "constants/ratings";

import { useLocale } from "hooks/useLocale";

import { formatRatingAverage } from "utils/formatRating";

import styles from "./RatingStars.module.scss";

interface RatingStarsProps {
    average: number | null;
    count: number;
}

const STAR_ICON_SIZE = 18;
const FULL_STAR_PERCENT = 100;

// each star fills by the part of the average that reaches it, so 4.5 draws four and a half
const starFillPercent = (average: number, starValue: number): number =>
    Math.min(Math.max(average - (starValue - 1), 0), 1) * FULL_STAR_PERCENT;

export const RatingStars: React.FC<RatingStarsProps> = ({ average, count }) => {
    const { t } = useTranslation("common");
    const locale = useLocale();
    const label =
        average === null
            ? t("rating.none")
            : t("rating.summary", {
                  average: formatRatingAverage(average, locale),
                  count,
              });

    return (
        <span className={styles["rating-stars"]} role="img" aria-label={label}>
            <span className={styles["rating-stars__row"]} aria-hidden="true">
                {RATING_VALUES.map((starValue) => (
                    <span
                        key={starValue}
                        className={styles["rating-stars__star"]}
                    >
                        <Star
                            size={STAR_ICON_SIZE}
                            className={styles["rating-stars__outline"]}
                        />
                        <span
                            className={styles["rating-stars__fill"]}
                            style={{
                                width: `${starFillPercent(average ?? 0, starValue)}%`,
                            }}
                        >
                            <Star
                                size={STAR_ICON_SIZE}
                                className={styles["rating-stars__filled"]}
                            />
                        </span>
                    </span>
                ))}
            </span>
            {average === null ? (
                <span
                    className={styles["rating-stars__count"]}
                    aria-hidden="true"
                >
                    {t("rating.none")}
                </span>
            ) : (
                <span aria-hidden="true">
                    <span className={styles["rating-stars__value"]}>
                        {formatRatingAverage(average, locale)}
                    </span>{" "}
                    <span className={styles["rating-stars__count"]}>
                        {t("rating.count", { count })}
                    </span>
                </span>
            )}
        </span>
    );
};
