import React from "react";

import type { IconProps } from "components/icons";

const DEFAULT_SIZE = 40;

// Donburi preset avatar - nigiri sushi, natural-colour variant (Claude Design handoff)
export const SushiAvatar: React.FC<IconProps> = ({
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
        <g transform="translate(64 64) scale(2.6) translate(-32 -34)">
            <g
                stroke="#D8CFBF"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path
                    d="M16 37c0-4 5-6 16-6s16 2 16 6v3a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4z"
                    fill="#F4EFE6"
                />
            </g>
            <g
                stroke="#C56F3C"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path
                    d="M16 32c0-5 6-8 16-8s16 3 16 8v1a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2z"
                    fill="#E8945E"
                />
            </g>
            <g stroke="#F6D9C4" strokeWidth={2} strokeLinecap="round">
                <path d="M22 29h6M34 30h6" />
            </g>
            <g
                stroke="#232C27"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M28.5 22h7v24h-7z" fill="#35413A" />
            </g>
        </g>
    </svg>
);
