import React from "react";

import styles from "./ContentCard.module.scss";
import type { ContentCardIcon } from "./ContentCard.types";
import { ContentCardChip } from "./ContentCardChip";
import { ContentCardFavourite } from "./ContentCardFavourite";

const IMAGE_ICON_SIZE = 40;
const ROW_IMAGE_ICON_SIZE = 26;

interface ContentCardImageProps {
    isRow: boolean;
    imageIcon: ContentCardIcon;
    chipLabel: string;
    favourite: boolean;
    showFavourite: boolean;
}

// for grid, this also carries the type chip + favourite button (absolutely positioned over the image); for row, those move into ContentCardRowHeader instead
export const ContentCardImage: React.FC<ContentCardImageProps> = ({
    isRow,
    imageIcon: ImageIcon,
    chipLabel,
    favourite,
    showFavourite,
}) => (
    <span className={styles["content-card__image"]}>
        <ImageIcon
            size={isRow ? ROW_IMAGE_ICON_SIZE : IMAGE_ICON_SIZE}
            aria-hidden="true"
            className={styles["content-card__image-icon"]}
        />
        {!isRow && <ContentCardChip isRow={isRow} label={chipLabel} />}
        {!isRow && showFavourite && (
            <ContentCardFavourite isRow={isRow} active={favourite} />
        )}
    </span>
);

interface ContentCardRowHeaderProps {
    chipLabel: string;
    favourite: boolean;
    showFavourite: boolean;
}

export const ContentCardRowHeader: React.FC<ContentCardRowHeaderProps> = ({
    chipLabel,
    favourite,
    showFavourite,
}) => (
    <span className={styles["content-card__row-header"]}>
        <ContentCardChip isRow label={chipLabel} />
        {showFavourite && <ContentCardFavourite isRow active={favourite} />}
    </span>
);
