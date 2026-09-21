import React from "react";

import { AvoidPill } from "components/ui/AvoidPill";
import { RatingSummary } from "components/ui/RatingSummary";

import styles from "./ContentCard.module.scss";
import {
    type ContentCardMetaItem,
    type ContentCardRating,
    META_ITEM_TONE_CALORIE_OVER,
} from "./ContentCard.types";
import { ContentCardAllergenBadge } from "./ContentCardAllergenBadge";

const META_ICON_SIZE = 14;
const STAR_ICON_SIZE = 14;
const ROW_META_COUNT = 1;

interface ContentCardBodyProps {
    isRow: boolean;
    badge: boolean;
    avoided: boolean;
    rating: ContentCardRating | null;
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
    avoided,
    rating,
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
                    {rating && (
                        <RatingSummary
                            average={rating.average}
                            count={rating.count}
                            iconSize={STAR_ICON_SIZE}
                            className={styles["content-card__rating-value"]}
                        />
                    )}
                    <span className={styles["content-card__marks"]}>
                        {avoided && <AvoidPill />}
                        {badge && <ContentCardAllergenBadge isRow={isRow} />}
                    </span>
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
                    {isRow && (avoided || badge) && (
                        <span className={styles["content-card__marks"]}>
                            {avoided && <AvoidPill compact />}
                            {badge && (
                                <ContentCardAllergenBadge isRow={isRow} />
                            )}
                        </span>
                    )}
                </span>
            )}
        </>
    );
};
