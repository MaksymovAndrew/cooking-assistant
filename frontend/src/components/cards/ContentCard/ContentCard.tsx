import React from "react";

import type { Locale } from "constants/locales";

import { Link } from "components/ui/Link";

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
    // an uploaded photo takes the icon's place; without one the card keeps its glyph
    imageSrc?: string | null;
    chipLabel: string;
    // the language the record is written in; null leaves the badge out
    language?: Locale | null;
    // icon+label meta row (recipe cards); mutually exclusive with metaText
    metaItems?: ContentCardMetaItem[];
    // plain-text meta line, no icons (menu cards' "Category: X · N recipes")
    metaText?: string;
    variant?: ContentCardVariant;
    mine?: boolean;
    badge?: boolean;
    // the viewer avoids something in it - a personal mark, shown beside the allergen badge rather than instead of it
    avoided?: boolean;
    // border-only signal (the calorie icon/text itself is recolored via a metaItem's own `tone`,
    // not through this prop) - kept as its own modifier so it can carry a different border color
    // than the allergen badge, and both can be active on the same card at once
    calorieOver?: boolean;
    // null hides the heart - a guest's card, or a record fetched without a per-viewer flag
    favourite?: ContentCardFavouriteState | null;
    // null leaves the rating out - a record fetched without its rating totals
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

    // an article with a title link stretched over it rather than one big link: the heart is a
    // button of its own, and a button nested inside an anchor is invalid markup
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
