import React from "react";

import type { IconProps } from "./Icon.types";

const DEFAULT_SIZE = 24;

// "portions" glyph - not a stock lucide icon
export const PortionsMark: React.FC<IconProps> = ({
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
        <path d="M3 11h18l-1.4 8.3A2 2 0 0 1 17.6 21H6.4a2 2 0 0 1-2-1.7z" />
        <path d="M12 3v5M8.5 4.5 12 8l3.5-3.5" />
    </svg>
);
