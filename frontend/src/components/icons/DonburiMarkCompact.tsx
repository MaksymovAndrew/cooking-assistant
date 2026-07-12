import React from "react";

import type { DonburiMarkProps } from "./DonburiMark.types";

const DEFAULT_SIZE = 20;

// Tier 2/5 - 20px - Donburi mark with 2 steam wisps only, spaced wide so they don't merge at small sizes
export const DonburiMarkCompact: React.FC<DonburiMarkProps> = ({
    size = DEFAULT_SIZE,
    className,
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
    >
        <path d="M12.5 12.5c-1-1.2 1-2.2 0-3.4" />
        <path d="M19.5 12.5c-1-1.2 1-2.2 0-3.4" />
        <path d="M5 15h22" />
        <path d="M5 15a11 11 0 0 0 22 0" />
    </svg>
);
