import React from "react";

import type { IconProps } from "./Icon.types";

const DEFAULT_SIZE = 24;

// hero/empty-state utensils glyph traced from Recipe Detail.dc.html - not a stock lucide icon
export const UtensilsMarkSimple: React.FC<IconProps> = ({
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
        <path d="M3 2v8c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2" />
        <path d="M5 2v20" />
        <path d="M21 14V2a5 5 0 0 0-5 5v7c0 1.1.9 2 2 2h3Zm0 0v8" />
    </svg>
);
