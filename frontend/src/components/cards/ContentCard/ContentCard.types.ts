import type React from "react";

import type { FavouriteTarget } from "constants/favourites";

export type ContentCardVariant = "grid" | "row";

// accepts both lucide-react icons and hand-authored components/icons/* glyphs
export type ContentCardIcon = React.ComponentType<{
    size?: number;
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
}>;

// a constant because i18next/no-literal-string flags a bare literal in a JSX attribute
export const META_ITEM_TONE_CALORIE_OVER = "calorieOver" as const;

export interface ContentCardMetaItem {
    icon: ContentCardIcon;
    label: string;
    tone?: typeof META_ITEM_TONE_CALORIE_OVER;
    title?: string;
}

export interface ContentCardRating {
    average: number | null;
    count: number;
}

export interface ContentCardFavouriteState {
    target: FavouriteTarget;
    id: number;
    isFavourite: boolean;
}
