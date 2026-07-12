import React from "react";

import type { DonburiMarkProps } from "./DonburiMark.types";

const DEFAULT_SIZE = 28;

// Tier 5/5 (biggest/richest), 64px down to 28px: double-bend steam + chopsticks + bowl + foot
export const DonburiMarkDetailed: React.FC<DonburiMarkProps> = ({
    size = DEFAULT_SIZE,
    className,
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
    >
        <path d="M10.5 12.4c-1.4-1.5 1.4-2.6 0-4.1 -1.4-1.5 1.4-2.6 0-4.1" />
        <path d="M14 12.4c-1.4-1.5 1.4-2.6 0-4.1 -1.4-1.5 1.4-2.6 0-4.1" />
        <path d="M13.5 16 28 8" />
        <path d="M14.3 17.6 28.8 9.6" />
        <path d="M5 15h22" />
        <path d="M5 15a11 11 0 0 0 22 0" />
        <path d="M13.5 25.6 12.7 27.2H19.3L18.5 25.6" />
    </svg>
);
