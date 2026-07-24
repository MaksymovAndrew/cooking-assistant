import React from "react";

import type { IconProps } from "components/icons";

const DEFAULT_SIZE = 40;

// Donburi preset avatar - chili, natural-colour variant (Claude Design handoff)
export const ChiliAvatar: React.FC<IconProps> = ({
    size = DEFAULT_SIZE,
    className,
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 128 128"
        fill="none"
        aria-hidden="true"
        className={className}
    >
        <g transform="translate(64 64) scale(2.45) translate(-34 -35)">
            <g
                stroke="#B24A43"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path
                    d="M41 26c6 6 3 19-8 24c-8 4-16-1-13-6c6 3 13-1 15-9c1-4 1-8 6-9z"
                    fill="#D9675E"
                />
            </g>
            <g
                stroke="#557045"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M41 26c-1-4 2-8 6-8M41 26c2-2 6-2 8 0" />
            </g>
        </g>
    </svg>
);
