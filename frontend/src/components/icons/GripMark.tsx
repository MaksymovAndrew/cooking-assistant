import React from "react";

import type { IconProps } from "./Icon.types";

const DEFAULT_SIZE = 24;

// drag-handle glyph - not a stock lucide icon
export const GripMark: React.FC<IconProps> = ({
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
        <path d="M9 5h2M9 12h2M9 19h2M13 5h2M13 12h2M13 19h2" />
    </svg>
);
