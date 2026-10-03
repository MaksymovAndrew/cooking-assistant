import React from "react";

import type { FavouriteToggle } from "hooks/useFavouriteToggle";

import { UtensilsMarkSimple } from "components/icons";
import { FavouriteButton } from "components/ui/FavouriteButton";

import styles from "./RecipeHero.module.scss";

interface RecipeHeroImageProps {
    photoSrc: string | null;
    photoSrcSet: string | null;
    title: string;
    // null for a guest, who gets no heart
    favourite: FavouriteToggle | null;
    favouriteLabel: string;
}

const IMAGE_ICON_SIZE = 56;
// 4:3, full width below desktop and about half the 1280px page beside the ingredients
const PHOTO_WIDTH = 1200;
const PHOTO_HEIGHT = 900;
const PHOTO_SIZES = "(min-width: 1280px) 640px, 100vw";
const FAVOURITE_ICON_SIZE = 20;

export const RecipeHeroImage: React.FC<RecipeHeroImageProps> = ({
    photoSrc,
    photoSrcSet,
    title,
    favourite,
    favouriteLabel,
}) => (
    <div className={styles["recipe-hero__image"]}>
        {photoSrc ? (
            // the page's largest element, so it is fetched first rather than lazily
            <img
                className={styles["recipe-hero__photo"]}
                src={photoSrc}
                srcSet={photoSrcSet ?? undefined}
                sizes={PHOTO_SIZES}
                width={PHOTO_WIDTH}
                height={PHOTO_HEIGHT}
                alt={title}
                fetchPriority="high"
            />
        ) : (
            <UtensilsMarkSimple
                size={IMAGE_ICON_SIZE}
                className={styles["recipe-hero__image-icon"]}
            />
        )}
        {favourite && (
            <FavouriteButton
                favourite={favourite}
                label={favouriteLabel}
                iconSize={FAVOURITE_ICON_SIZE}
                className={styles["recipe-hero__favourite"]}
            />
        )}
    </div>
);
