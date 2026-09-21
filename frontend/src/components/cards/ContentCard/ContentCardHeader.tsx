import React from "react";

import { RecordPhoto } from "components/ui/RecordPhoto";

import styles from "./ContentCard.module.scss";
import type {
    ContentCardFavouriteState,
    ContentCardIcon,
} from "./ContentCard.types";
import { ContentCardChip } from "./ContentCardChip";
import { ContentCardFavourite } from "./ContentCardFavourite";

const IMAGE_ICON_SIZE = 40;
const ROW_IMAGE_ICON_SIZE = 26;

interface ContentCardImageProps {
    isRow: boolean;
    imageIcon: ContentCardIcon;
    imageSrc: string | null;
    chipLabel: string;
    favourite: ContentCardFavouriteState | null;
}

// for grid, this also carries the type chip + favourite button (absolutely positioned over the image); for row, those move into ContentCardRowHeader instead
export const ContentCardImage: React.FC<ContentCardImageProps> = ({
    isRow,
    imageIcon: ImageIcon,
    imageSrc,
    chipLabel,
    favourite,
}) => (
    <span className={styles["content-card__image"]}>
        <RecordPhoto
            src={imageSrc}
            fallback={
                <ImageIcon
                    size={isRow ? ROW_IMAGE_ICON_SIZE : IMAGE_ICON_SIZE}
                    aria-hidden="true"
                    className={styles["content-card__image-icon"]}
                />
            }
        />
        {!isRow && <ContentCardChip isRow={isRow} label={chipLabel} />}
        {!isRow && favourite && (
            <ContentCardFavourite isRow={isRow} {...favourite} />
        )}
    </span>
);

interface ContentCardRowHeaderProps {
    chipLabel: string;
    favourite: ContentCardFavouriteState | null;
}

export const ContentCardRowHeader: React.FC<ContentCardRowHeaderProps> = ({
    chipLabel,
    favourite,
}) => (
    <span className={styles["content-card__row-header"]}>
        <ContentCardChip isRow label={chipLabel} />
        {favourite && <ContentCardFavourite isRow {...favourite} />}
    </span>
);
