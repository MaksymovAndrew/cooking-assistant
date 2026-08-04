import React from "react";
import { Link } from "react-router-dom";

import { RECIPE_RATING, RECIPE_RATING_COUNT } from "constants/ratings";

import styles from "./ContentCard.module.scss";
import type {
    ContentCardIcon,
    ContentCardMetaItem,
    ContentCardVariant,
} from "./ContentCard.types";
import { ContentCardBody } from "./ContentCardBody";
import { ContentCardImage, ContentCardRowHeader } from "./ContentCardHeader";

export type {
    ContentCardIcon,
    ContentCardMetaItem,
    ContentCardVariant,
} from "./ContentCard.types";
export { META_ITEM_TONE_CALORIE_OVER } from "./ContentCard.types";

interface ContentCardProps {
    to: string;
    title: string;
    imageIcon: ContentCardIcon;
    chipLabel: string;
    // icon+label meta row (recipe cards); mutually exclusive with metaText
    metaItems?: ContentCardMetaItem[];
    // plain-text meta line, no icons (menu cards' "Category: X · N recipes")
    metaText?: string;
    variant?: ContentCardVariant;
    mine?: boolean;
    badge?: boolean;
    // border-only signal (the calorie icon/text itself is recolored via a metaItem's own `tone`,
    // not through this prop) - kept as its own modifier so it can carry a different border color
    // than the allergen badge, and both can be active on the same card at once
    calorieOver?: boolean;
    favourite?: boolean;
    showFavourite?: boolean;
    rating?: string;
    ratingCount?: string;
}

export const ContentCard: React.FC<ContentCardProps> = ({
    to,
    title,
    imageIcon: ImageIcon,
    chipLabel,
    metaItems = [],
    metaText,
    variant = "grid",
    mine = false,
    badge = false,
    calorieOver = false,
    favourite = false,
    showFavourite = true,
    rating = RECIPE_RATING,
    ratingCount = RECIPE_RATING_COUNT,
}) => {
    const isRow = variant === "row";

    const cardClassNames = [
        styles["content-card"],
        styles[`content-card--${variant}`],
        mine && styles["content-card--mine"],
        badge && styles["content-card--badge"],
        // declared after --badge in both class order and SCSS source, so a card that's somehow
        // both allergenic and over budget shows the calorie-over border - the more actionable cue
        calorieOver && styles["content-card--calorie-over"],
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <Link to={to} className={cardClassNames}>
            <ContentCardImage
                isRow={isRow}
                imageIcon={ImageIcon}
                chipLabel={chipLabel}
                favourite={favourite}
                showFavourite={showFavourite}
            />
            <span className={styles["content-card__body"]}>
                {isRow && (
                    <ContentCardRowHeader
                        chipLabel={chipLabel}
                        favourite={favourite}
                        showFavourite={showFavourite}
                    />
                )}
                <h3 className={styles["content-card__title"]} title={title}>
                    {title}
                </h3>
                <ContentCardBody
                    isRow={isRow}
                    badge={badge}
                    rating={rating}
                    ratingCount={ratingCount}
                    metaText={metaText}
                    metaItems={metaItems}
                />
            </span>
        </Link>
    );
};
