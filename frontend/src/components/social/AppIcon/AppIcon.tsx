import React from "react";

import { DonburiMarkDetailed } from "components/icons";
import { SOCIAL_COLORS } from "components/social/SocialCard/SocialCard.styles";

interface AppIconProps {
    size: number;
}

// the mark keeps inside the circle a launcher crops a maskable icon to
const MARK_SCALE = 0.6;

// rendered to a PNG: inline styles only, full-bleed, since iOS fills a transparent icon with black
export const AppIcon: React.FC<AppIconProps> = ({ size }) => (
    <div
        style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            color: SOCIAL_COLORS.brand,
            backgroundColor: SOCIAL_COLORS.bg,
        }}
    >
        <DonburiMarkDetailed size={Math.round(size * MARK_SCALE)} />
    </div>
);
