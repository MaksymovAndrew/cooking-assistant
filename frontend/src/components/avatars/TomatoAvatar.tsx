import React from "react";

import type { IconProps } from "components/icons";

const DEFAULT_SIZE = 40;

// Donburi preset avatar - tomato, natural-colour variant (Claude Design handoff)
export const TomatoAvatar: React.FC<IconProps> = ({
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
        <g transform="translate(64 64) scale(2.45) translate(-32 -36)">
            <g
                stroke="#B24A43"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path
                    d="M32 25c9 0 16 6 16 15c0 8-7 13-16 13s-16-5-16-13c0-9 7-15 16-15z"
                    fill="#D9675E"
                />
            </g>
            <g
                stroke="#557045"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M32 25v-6M32 22l-6-3M32 22l6-3M32 24l-9-1M32 24l9-1" />
            </g>
        </g>
    </svg>
);
