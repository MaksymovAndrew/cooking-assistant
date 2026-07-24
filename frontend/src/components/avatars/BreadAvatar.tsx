import React from "react";

import type { IconProps } from "components/icons";

const DEFAULT_SIZE = 40;

// Donburi preset avatar - rye loaf, natural-colour variant (Claude Design handoff)
export const BreadAvatar: React.FC<IconProps> = ({
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
        <g transform="translate(64 64) scale(2.45) translate(-32 -35)">
            <g
                stroke="#8A5E36"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M14 41c0-12 8-18 18-18s18 6 18 18z" fill="#B07D4E" />
                <path
                    d="M12 41h40v3a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4z"
                    fill="#A06E42"
                />
                <path d="M24 30c1 3 1 6 0 9M32 28v11M40 30c-1 3-1 6 0 9" />
            </g>
        </g>
    </svg>
);
