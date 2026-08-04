import { Star } from "lucide-react";
import React from "react";

import styles from "./ContentCard.module.scss";
import {
    type ContentCardMetaItem,
    META_ITEM_TONE_CALORIE_OVER,
} from "./ContentCard.types";
import { ContentCardAllergenBadge } from "./ContentCardAllergenBadge";

const META_ICON_SIZE = 14;
const STAR_ICON_SIZE = 14;
const ROW_META_COUNT = 1;

interface ContentCardBodyProps {
    isRow: boolean;
    badge: boolean;
    rating: string;
    ratingCount: string;
    metaText?: string;
    metaItems: ContentCardMetaItem[];
}

const metaItemClassName = (tone: ContentCardMetaItem["tone"]): string =>
    [
        styles["content-card__meta-item"],
        tone === META_ITEM_TONE_CALORIE_OVER &&
            styles["content-card__meta-item--calorie-over"],
    ]
        .filter(Boolean)
        .join(" ");

export const ContentCardBody: React.FC<ContentCardBodyProps> = ({
    isRow,
    badge,
    rating,
    ratingCount,
    metaText,
    metaItems,
}) => {
    const visibleMetaItems = isRow
        ? metaItems.slice(0, ROW_META_COUNT)
        : metaItems;

    return (
        <>
            {!isRow && (
                <span className={styles["content-card__rating"]}>
                    <Star
                        size={STAR_ICON_SIZE}
                        aria-hidden="true"
                        className={styles["content-card__rating-star"]}
                    />
                    {rating}
                    <span className={styles["content-card__rating-count"]}>
                        {ratingCount}
                    </span>
                    {badge && <ContentCardAllergenBadge isRow={isRow} />}
                </span>
            )}
            {metaText ? (
                <span className={styles["content-card__meta-text"]}>
                    {metaText}
                </span>
            ) : (
                <span className={styles["content-card__meta"]}>
                    {visibleMetaItems.map(
                        ({ icon: Icon, label, tone, title }) => (
                            <span
                                key={label}
                                title={title}
                                className={metaItemClassName(tone)}
                            >
                                <Icon
                                    size={META_ICON_SIZE}
                                    aria-hidden="true"
                                />
                                {label}
                            </span>
                        ),
                    )}
                    {isRow && badge && (
                        <ContentCardAllergenBadge isRow={isRow} />
                    )}
                </span>
            )}
        </>
    );
};
