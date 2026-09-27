import React from "react";

import type { Locale } from "constants/locales";

import { LanguageBadge } from "components/ui/LanguageBadge";
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
    language: Locale | null;
    favourite: ContentCardFavouriteState | null;
}

// for grid, this also carries the type chip + favourite button (absolutely positioned over the image); for row, those move into ContentCardRowHeader instead
export const ContentCardImage: React.FC<ContentCardImageProps> = ({
    isRow,
    imageIcon: ImageIcon,
    imageSrc,
    chipLabel,
    language,
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
        {!isRow && (
            <span className={styles["content-card__tags"]}>
                <ContentCardChip isRow={isRow} label={chipLabel} />
                {language && (
                    <LanguageBadge language={language} tone="overlay" />
                )}
            </span>
        )}
        {!isRow && favourite && (
            <ContentCardFavourite isRow={isRow} {...favourite} />
        )}
    </span>
);

interface ContentCardRowHeaderProps {
    chipLabel: string;
    language: Locale | null;
    favourite: ContentCardFavouriteState | null;
}

export const ContentCardRowHeader: React.FC<ContentCardRowHeaderProps> = ({
    chipLabel,
    language,
    favourite,
}) => (
    <span className={styles["content-card__row-header"]}>
        <span className={styles["content-card__tags"]}>
            <ContentCardChip isRow label={chipLabel} />
            {language && <LanguageBadge language={language} />}
        </span>
        {favourite && <ContentCardFavourite isRow {...favourite} />}
    </span>
);
