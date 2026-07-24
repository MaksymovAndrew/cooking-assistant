import React from "react";

import type { IconProps } from "components/icons";

const DEFAULT_SIZE = 40;

// Donburi preset avatar - cooking pot, natural-colour variant (Claude Design handoff)
export const PotAvatar: React.FC<IconProps> = ({
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
        <g transform="translate(64 64) scale(2.45) translate(-32 -32)">
            <g
                stroke="#6F7580"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path
                    d="M16 33h32v11a6 6 0 0 1-6 6H22a6 6 0 0 1-6-6z"
                    fill="#9AA0AD"
                />
                <path d="M12 37h4M48 37h4" />
                <path d="M14 33h36" />
                <path d="M18 33c0-8 28-8 28 0" fill="#B4B9C4" />
            </g>
            <g
                stroke="#A29DAD"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M27 20c-2-3 2-4 0-7M37 20c-2-3 2-4 0-7" />
            </g>
        </g>
    </svg>
);
