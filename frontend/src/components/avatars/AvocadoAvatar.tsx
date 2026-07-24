import React from "react";

import type { IconProps } from "components/icons";

const DEFAULT_SIZE = 40;

// Donburi preset avatar - avocado, natural-colour variant (Claude Design handoff)
export const AvocadoAvatar: React.FC<IconProps> = ({
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
                stroke="#557045"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path
                    d="M32 15c8 0 14 9 14 20c0 9-6 16-14 16s-14-7-14-16c0-11 6-20 14-20z"
                    fill="#6E8F5A"
                />
                <path
                    d="M32 22c5 0 9 6 9 14c0 6-4 11-9 11s-9-5-9-11c0-8 4-14 9-14z"
                    fill="#B7CE97"
                />
            </g>
            <circle cx={32} cy={37} r={6.5} fill="#8A5E38" />
        </g>
    </svg>
);
