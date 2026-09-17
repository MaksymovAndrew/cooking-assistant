import React from "react";

import styles from "./ProgressRing.module.scss";

interface ProgressRingProps {
    // 0..1, clamped
    fraction: number;
    // viewBox units; the rendered size comes from className
    size: number;
    thickness: number;
    // empty space between the ring and the viewBox edge
    inset?: number;
    className?: string;
    children?: React.ReactNode;
}

// the arc is measured in percent through pathLength, so the draw-in keyframe needs no per-size value
const PATH_LENGTH = 100;

const clamp = (fraction: number): number => Math.min(Math.max(fraction, 0), 1);

export const ProgressRing: React.FC<ProgressRingProps> = ({
    fraction,
    size,
    thickness,
    inset = 0,
    className,
    children,
}) => {
    const center = size / 2;
    const radius = center - inset - thickness / 2;
    const filled = clamp(fraction);

    return (
        <div
            className={[styles["progress-ring"], className]
                .filter(Boolean)
                .join(" ")}
        >
            <svg
                viewBox={`0 0 ${size} ${size}`}
                className={styles["progress-ring__svg"]}
                aria-hidden="true"
            >
                <circle
                    className={styles["progress-ring__track"]}
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeWidth={thickness}
                />
                {/* a round cap would still paint a dot for an empty arc */}
                {filled > 0 && (
                    <circle
                        data-testid="progress-ring-arc"
                        className={styles["progress-ring__arc"]}
                        cx={center}
                        cy={center}
                        r={radius}
                        strokeWidth={thickness}
                        pathLength={PATH_LENGTH}
                        strokeDasharray={PATH_LENGTH}
                        strokeDashoffset={PATH_LENGTH * (1 - filled)}
                        transform={`rotate(-90 ${center} ${center})`}
                    />
                )}
            </svg>
            {children && (
                <div className={styles["progress-ring__center"]}>
                    {children}
                </div>
            )}
        </div>
    );
};
