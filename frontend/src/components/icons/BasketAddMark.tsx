import React from "react";

import type { IconProps } from "./Icon.types";

const DEFAULT_SIZE = 24;

// "add to pantry" glyph - not a stock lucide icon
export const BasketAddMark: React.FC<IconProps> = ({
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
        <path d="M3 7l1-3h16l1 3" />
        <path d="M4 7h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
        <path d="M12 11v5M9.5 13.5h5" />
    </svg>
);
