import React from "react";

import type { DonburiMarkProps } from "./DonburiMark.types";

const DEFAULT_SIZE = 16;

// Tier 1/5 (smallest) - 16px - bare-minimum Donburi mark: bowl + one short steam wisp, max stroke contrast, tightest UI slots only
export const DonburiMarkMinimal: React.FC<DonburiMarkProps> = ({
    size = DEFAULT_SIZE,
    className,
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
    >
        <path d="M16 13c-1-1.2 1-2 0-3.3" />
        <path d="M5 15h22" />
        <path d="M5 15a11 11 0 0 0 22 0" />
    </svg>
);
