import React from "react";

import type { IconProps } from "components/icons";

const DEFAULT_SIZE = 40;

// Donburi preset avatar - citrus slice, natural-colour variant (Claude Design handoff)
export const LemonAvatar: React.FC<IconProps> = ({
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
        <g transform="translate(64 64) scale(2.45) translate(-32 -33)">
            <g
                stroke="#C99E2E"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx={32} cy={33} r={17} fill="#E7C24A" />
                <circle cx={32} cy={33} r={11.5} fill="#F1DA8E" />
                <path d="M32 33 32 16M32 33 47 24.5M32 33 47 41.5M32 33 32 50M32 33 17 41.5M32 33 17 24.5" />
            </g>
        </g>
    </svg>
);
