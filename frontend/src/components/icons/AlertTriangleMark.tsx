import React from "react";

import type { IconProps } from "./Icon.types";

const DEFAULT_SIZE = 24;

// "contains allergens" glyph - not a stock lucide icon
export const AlertTriangleMark: React.FC<IconProps> = ({
    size = DEFAULT_SIZE,
    className,
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.1}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
    >
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <path d="M12 9v4M12 17h.01" />
    </svg>
);
