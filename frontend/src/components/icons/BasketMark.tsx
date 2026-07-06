import React from "react";

import type { IconProps } from "./Icon.types";

const DEFAULT_SIZE = 24;

// "pantry" glyph traced from Design System.dc.html's iconography legend - not a stock lucide icon
export const BasketMark: React.FC<IconProps> = ({
    size = DEFAULT_SIZE,
    className,
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
    >
        <path d="M9 4 6 11M15 4l3 7M3 11h18l-1.4 8.3A2 2 0 0 1 17.6 21H6.4a2 2 0 0 1-2-1.7z" />
        <path d="M9 15v3M15 15v3" />
    </svg>
);
