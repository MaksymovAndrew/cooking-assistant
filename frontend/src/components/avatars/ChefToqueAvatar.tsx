import React from "react";

import type { IconProps } from "components/icons";

const DEFAULT_SIZE = 40;

// Donburi preset avatar - chef toque, natural-colour variant (Claude Design handoff)
export const ChefToqueAvatar: React.FC<IconProps> = ({
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
                stroke="#8B8399"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path
                    d="M22 44c-7 0-9-10-3-12c-4-7 3-12 8-8c0-8 10-8 10 0c5-4 12 1 8 8c6 2 4 12-3 12z"
                    fill="#FFFFFF"
                />
                <path
                    d="M22 44h20v5a3 3 0 0 1-3 3H25a3 3 0 0 1-3-3z"
                    fill="#FFFFFF"
                />
                <path d="M28 44v6M32 44v6M36 44v6" />
            </g>
        </g>
    </svg>
);
