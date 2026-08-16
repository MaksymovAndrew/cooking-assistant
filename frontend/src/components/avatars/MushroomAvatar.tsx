import React from "react";

import type { IconProps } from "components/icons";

const DEFAULT_SIZE = 40;

// Donburi preset avatar - mushroom, natural-colour variant (Claude Design handoff)
export const MushroomAvatar: React.FC<IconProps> = ({
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
        <g transform="translate(64 64) scale(2.31) translate(-32 -33)">
            <g
                stroke="#CBBE9A"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M26 34v9a6 6 0 0 0 12 0v-9" fill="#EDE3C9" />
            </g>
            <g
                stroke="#A9463C"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M14 34c0-11 8-17 18-17s18 6 18 17z" fill="#C25E52" />
                <path d="M14 34h36" />
            </g>
            <circle cx={26} cy={26} r={2.4} fill="#FFFFFF" />
            <circle cx={37.5} cy={28} r={2} fill="#FFFFFF" />
        </g>
    </svg>
);
