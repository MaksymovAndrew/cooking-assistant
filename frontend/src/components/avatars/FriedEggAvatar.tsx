import React from "react";

import type { IconProps } from "components/icons";

const DEFAULT_SIZE = 40;

// Donburi preset avatar - fried egg, natural-colour variant (Claude Design handoff)
export const FriedEggAvatar: React.FC<IconProps> = ({
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
        <g transform="translate(64 64) scale(2.45) translate(-31 -36)">
            <g
                stroke="#E0D6BE"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path
                    d="M24 24c4-3 10-2 12 2c5-2 11 2 10 8c4 3 2 10-3 11c-1 5-8 7-12 3c-5 3-12-1-11-6c-6-1-8-9-3-13c2-4 5-6 7-5z"
                    fill="#FFFFFF"
                />
            </g>
            <g
                stroke="#C98F2E"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx={31} cy={36} r={8} fill="#E7B24A" />
            </g>
        </g>
    </svg>
);
