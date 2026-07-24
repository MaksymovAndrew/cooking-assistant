import React from "react";

import type { IconProps } from "components/icons";

const DEFAULT_SIZE = 40;

// Donburi preset avatar - herb sprig, natural-colour variant (Claude Design handoff)
export const HerbAvatar: React.FC<IconProps> = ({
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
        <g transform="translate(64 64) scale(2.45) translate(-34 -32)">
            <g
                stroke="#557045"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M34 51c-1-12-1-22 2-32" />
                <path
                    d="M34 43c-6 1-10-2-10-7c5-1 9 1 10 5zM35 35c6 1 10-2 10-7c-5-1-9 1-10 5zM35 27c-5 0-9-3-8-8c5 0 8 3 8 5zM36 19c0-6 4-10 9-9c0 5-4 9-9 9z"
                    fill="#7BA05F"
                />
            </g>
        </g>
    </svg>
);
