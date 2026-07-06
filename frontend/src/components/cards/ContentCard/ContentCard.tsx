import { Heart, Star } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import styles from "./ContentCard.module.scss";

export type ContentCardVariant = "grid" | "row";

// accepts both lucide-react icons and hand-authored components/icons/* glyphs
export type ContentCardIcon = React.ComponentType<{
    size?: number;
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
}>;

export interface ContentCardMetaItem {
    icon: ContentCardIcon;
    label: string;
}

interface ContentCardProps {
    to: string;
    title: string;
    imageIcon: ContentCardIcon;
    chipLabel: string;
    metaItems: ContentCardMetaItem[];
    variant?: ContentCardVariant;
    mine?: boolean;
    badge?: boolean;
    favourite?: boolean;
}

const IMAGE_ICON_SIZE = 40;
const ROW_IMAGE_ICON_SIZE = 26;
const HEART_ICON_SIZE = 18;
const META_ICON_SIZE = 14;
const STAR_ICON_SIZE = 14;
// no rating data exists on the backend yet - a fixed decorative value matches the
// design's rating row without implying real per-item review counts
const PLACEHOLDER_RATING = "4.8";
// the row variant only has room for one meta item (time) per the design
const ROW_META_COUNT = 1;

const ContentCardChip: React.FC<{ isRow: boolean; label: string }> = ({
    isRow,
    label,
}) => (
    <span
        className={[
            styles["content-card__chip"],
            isRow && styles["content-card__chip--row"],
        ]
            .filter(Boolean)
            .join(" ")}
    >
        {label}
    </span>
);

const ContentCardFavourite: React.FC<{ isRow: boolean; active: boolean }> = ({
    isRow,
    active,
}) => {
    const { t } = useTranslation();

    return (
        <button
            type="button"
            disabled
            aria-label={t("contentCard.favourite")}
            className={[
                styles["content-card__favourite"],
                isRow && styles["content-card__favourite--row"],
                active && styles["content-card__favourite--active"],
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <Heart size={HEART_ICON_SIZE} aria-hidden="true" />
        </button>
    );
};

export const ContentCard: React.FC<ContentCardProps> = ({
    to,
    title,
    imageIcon: ImageIcon,
    chipLabel,
    metaItems,
    variant = "grid",
    mine = false,
    badge = false,
    favourite = false,
}) => {
    const isRow = variant === "row";

    const cardClassNames = [
        styles["content-card"],
        styles[`content-card--${variant}`],
        mine && styles["content-card--mine"],
        badge && styles["content-card--badge"],
    ]
        .filter(Boolean)
        .join(" ");

    const visibleMetaItems = isRow
        ? metaItems.slice(0, ROW_META_COUNT)
        : metaItems;

    return (
        <Link to={to} className={cardClassNames}>
            <span className={styles["content-card__image"]}>
                <ImageIcon
                    size={isRow ? ROW_IMAGE_ICON_SIZE : IMAGE_ICON_SIZE}
                    aria-hidden="true"
                    className={styles["content-card__image-icon"]}
                />
                {!isRow && <ContentCardChip isRow={isRow} label={chipLabel} />}
                {!isRow && (
                    <ContentCardFavourite isRow={isRow} active={favourite} />
                )}
            </span>
            <span className={styles["content-card__body"]}>
                {isRow && (
                    <span className={styles["content-card__row-header"]}>
                        <ContentCardChip isRow={isRow} label={chipLabel} />
                        <ContentCardFavourite
                            isRow={isRow}
                            active={favourite}
                        />
                    </span>
                )}
                <h3 className={styles["content-card__title"]} title={title}>
                    {title}
                </h3>
                {!isRow && (
                    <span className={styles["content-card__rating"]}>
                        <Star size={STAR_ICON_SIZE} aria-hidden="true" />
                        {PLACEHOLDER_RATING}
                    </span>
                )}
                <span className={styles["content-card__meta"]}>
                    {visibleMetaItems.map(({ icon: Icon, label }) => (
                        <span
                            key={label}
                            className={styles["content-card__meta-item"]}
                        >
                            <Icon size={META_ICON_SIZE} aria-hidden="true" />
                            {label}
                        </span>
                    ))}
                </span>
            </span>
        </Link>
    );
};
