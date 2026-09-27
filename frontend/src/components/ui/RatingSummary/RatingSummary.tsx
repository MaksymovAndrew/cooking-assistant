import { Star } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { useLocale } from "hooks/useLocale";

import { formatRatingAverage } from "utils/formatRating";

import styles from "./RatingSummary.module.scss";

interface RatingSummaryProps {
    average: number | null;
    count: number;
    iconSize: number;
    className: string;
    // a card too small for the count shows the average alone
    showCount?: boolean;
    // a card too small for "No ratings yet" shows nothing until the first vote
    hideWhenEmpty?: boolean;
}

// the one-line star, average and count every card and hero header prints
export const RatingSummary: React.FC<RatingSummaryProps> = ({
    average,
    count,
    iconSize,
    className,
    showCount = true,
    hideWhenEmpty = false,
}) => {
    const { t } = useTranslation("common");
    const locale = useLocale();

    if (average === null) {
        return hideWhenEmpty ? null : (
            <span className={className}>
                <span className={styles["rating-summary__empty"]}>
                    {t("rating.none")}
                </span>
            </span>
        );
    }

    const formatted = formatRatingAverage(average, locale);

    return (
        <span className={className}>
            <span className={styles["rating-summary__sr"]}>
                {t("rating.summary", { average: formatted, count })}
            </span>
            <Star
                size={iconSize}
                aria-hidden="true"
                className={styles["rating-summary__star"]}
            />
            <span aria-hidden="true">{formatted}</span>
            {showCount && (
                <span
                    className={styles["rating-summary__count"]}
                    aria-hidden="true"
                >
                    {t("rating.count", { count })}
                </span>
            )}
        </span>
    );
};
