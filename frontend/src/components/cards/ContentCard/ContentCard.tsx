import React from "react";

import type { Locale } from "constants/locales";

import { Link } from "components/ui/Link";

import { cx } from "utils/cx";

import styles from "./ContentCard.module.scss";
import type {
    ContentCardFavouriteState,
    ContentCardIcon,
    ContentCardMetaItem,
    ContentCardRating,
    ContentCardVariant,
} from "./ContentCard.types";
import { ContentCardBody } from "./ContentCardBody";
import { ContentCardImage, ContentCardRowHeader } from "./ContentCardHeader";

export type {
    ContentCardFavouriteState,
    ContentCardIcon,
    ContentCardMetaItem,
    ContentCardRating,
    ContentCardVariant,
} from "./ContentCard.types";
export { META_ITEM_TONE_CALORIE_OVER } from "./ContentCard.types";

interface ContentCardProps {
    href: string;
    title: string;
    imageIcon: ContentCardIcon;
    imageSrc?: string | null;
    chipLabel: string | null;
    language?: Locale | null;
    // mutually exclusive with metaText
    metaItems?: ContentCardMetaItem[];
    metaText?: string;
    variant?: ContentCardVariant;
    mine?: boolean;
    badge?: boolean;
    // a personal mark, shown beside the allergen badge, never instead of it
    avoided?: boolean;
    // border only; the calorie text is recolored by its meta item's own tone
    calorieOver?: boolean;
    favourite?: ContentCardFavouriteState | null;
    rating?: ContentCardRating | null;
}

export const ContentCard: React.FC<ContentCardProps> = ({
    href,
    title,
    imageIcon: ImageIcon,
    imageSrc = null,
    chipLabel,
    language = null,
    metaItems = [],
    metaText,
    variant = "grid",
    mine = false,
    badge = false,
    avoided = false,
    calorieOver = false,
    favourite = null,
    rating = null,
}) => {
    const isRow = variant === "row";

    const cardClassNames = cx(
        styles["content-card"],
        styles[`content-card--${variant}`],
        mine && styles["content-card--mine"],
        badge && styles["content-card--badge"],
        calorieOver && styles["content-card--calorie-over"],
    );

    // not one big link: a heart button nested inside an anchor is invalid markup
    return (
        <article className={cardClassNames}>
            <ContentCardImage
                isRow={isRow}
                imageIcon={ImageIcon}
                imageSrc={imageSrc}
                chipLabel={chipLabel}
                language={language}
                favourite={favourite}
            />
            <span className={styles["content-card__body"]}>
                {isRow && (
                    <ContentCardRowHeader
                        chipLabel={chipLabel}
                        language={language}
                        favourite={favourite}
                    />
                )}
                <h3 className={styles["content-card__title"]} title={title}>
                    <Link href={href} className={styles["content-card__link"]}>
                        {title}
                    </Link>
                </h3>
                <ContentCardBody
                    isRow={isRow}
                    badge={badge}
                    avoided={avoided}
                    rating={rating}
                    metaText={metaText}
                    metaItems={metaItems}
                />
            </span>
        </article>
    );
};
