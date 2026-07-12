import React from "react";

import type { DonburiMarkProps } from "./DonburiMark.types";

const DEFAULT_SIZE = 24;

// Tier 3/5 (middle) - 24px - Donburi mark with 3 symmetric steam wisps, chopsticks dropped (too fine at this size)
export const DonburiMarkSimple: React.FC<DonburiMarkProps> = ({
    size = DEFAULT_SIZE,
    className,
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
    >
        <path d="M11 13c-1.1-1.3 1.1-2.3 0-3.6" />
        <path d="M16 12.6c-1.1-1.4 1.1-2.4 0-3.8" />
        <path d="M21 13c-1.1-1.3 1.1-2.3 0-3.6" />
        <path d="M5 15h22" />
        <path d="M5 15a11 11 0 0 0 22 0" />
    </svg>
);
