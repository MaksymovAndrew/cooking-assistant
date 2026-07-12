import type React from "react";

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
