import React from "react";

import type { IconProps } from "components/icons";

const DEFAULT_SIZE = 40;

// Donburi preset avatar - ramen/donburi bowl, natural-colour variant (Claude Design handoff)
export const RamenBowlAvatar: React.FC<IconProps> = ({
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
        <g transform="translate(64 64) scale(1.89) translate(-34 -35)">
            <g
                stroke="#A9463C"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M14 33h36a18 18 0 0 1-36 0z" fill="#C25E52" />
                <path d="M12 33h40" />
            </g>
            <g
                stroke="#B07D4E"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M33 31 54 18M35 34 56 22" />
            </g>
            <g
                stroke="#A29DAD"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M26 25c-2-3 2-4 0-7M33 25c-2-3 2-4 0-7" />
            </g>
        </g>
    </svg>
);
