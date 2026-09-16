import { Heart } from "lucide-react";
import React from "react";

import type { FavouriteToggle } from "hooks/useFavouriteToggle";

import styles from "./FavouriteButton.module.scss";

interface FavouriteButtonProps {
    favourite: FavouriteToggle;
    label: string;
    iconSize: number;
    className: string;
    // visible text beside the heart; the accessible name is always `label`, the state is aria-pressed
    children?: React.ReactNode;
}

export const FavouriteButton: React.FC<FavouriteButtonProps> = ({
    favourite,
    label,
    iconSize,
    className,
    children,
}) => (
    <button
        type="button"
        onClick={() => {
            favourite.toggle().catch(() => undefined);
        }}
        disabled={favourite.isDisabled}
        aria-pressed={favourite.isFavourite}
        aria-label={label}
        className={[
            className,
            favourite.isFavourite && styles["favourite-button--active"],
        ]
            .filter(Boolean)
            .join(" ")}
    >
        <Heart size={iconSize} aria-hidden="true" />
        {children}
    </button>
);
