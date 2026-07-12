import React from "react";

import type { IconProps } from "./Icon.types";

const DEFAULT_SIZE = 24;

// recipe-card placeholder glyph - not a stock lucide icon
export const UtensilsMark: React.FC<IconProps> = ({
    size = DEFAULT_SIZE,
    className,
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
    >
        <path d="M6 3v4.5c0 1.9 1.35 3 3 3s3-1.1 3-3V3" />
        <path d="M9 3v4.5" />
        <path d="M9 10.5V21" />
        <path d="M20 15V2a4 4 0 0 0-4 4v5c0 1.1.9 2 2 2h2Z" />
        <path d="M20 15v6" />
    </svg>
);
