import React from "react";

import type { IconProps } from "./Icon.types";

const DEFAULT_SIZE = 24;

// menu-card placeholder glyph traced from Menus.dc.html - not a stock lucide icon
export const NotebookMark: React.FC<IconProps> = ({
    size = DEFAULT_SIZE,
    className,
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
    >
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M8 7h8M8 11h8M8 15h5" />
    </svg>
);
