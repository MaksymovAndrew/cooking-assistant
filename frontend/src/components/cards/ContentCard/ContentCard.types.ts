import type React from "react";

export type ContentCardVariant = "grid" | "row";

// accepts both lucide-react icons and hand-authored components/icons/* glyphs
export type ContentCardIcon = React.ComponentType<{
    size?: number;
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
}>;

// a non-inline constant so callers never need a bare "calorieOver" string literal
// (eslint's i18next/no-literal-string flags string literals inside JSX attribute expressions)
export const META_ITEM_TONE_CALORIE_OVER = "calorieOver" as const;

export interface ContentCardMetaItem {
    icon: ContentCardIcon;
    label: string;
    // recolors this one meta item (icon + text) - currently only the calorie-over-budget cue
    tone?: typeof META_ITEM_TONE_CALORIE_OVER;
    title?: string;
}
