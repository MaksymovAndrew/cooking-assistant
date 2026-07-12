import React from "react";

import type { IconProps } from "./Icon.types";

const DEFAULT_SIZE = 24;

// "stats" glyph - not a stock lucide icon
export const BarChartMark: React.FC<IconProps> = ({
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
        <path d="M3 21h18M6 21v-7M12 21V5M18 21v-4" />
    </svg>
);
