import React from "react";

import type { FavouriteToggle } from "hooks/useFavouriteToggle";

import { UtensilsMarkSimple } from "components/icons";
import { FavouriteButton } from "components/ui/FavouriteButton";

import styles from "./RecipeHero.module.scss";

interface RecipeHeroImageProps {
    photoSrc: string | null;
    title: string;
    // null for a guest, who gets no heart
    favourite: FavouriteToggle | null;
    favouriteLabel: string;
}

const IMAGE_ICON_SIZE = 56;
const FAVOURITE_ICON_SIZE = 20;

export const RecipeHeroImage: React.FC<RecipeHeroImageProps> = ({
    photoSrc,
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
