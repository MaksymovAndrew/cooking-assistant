import { Star } from "lucide-react";
import React from "react";

import { cx } from "utils/cx";

import styles from "./StarRatingInput.module.scss";

interface RatingStarProps {
    starRef: (element: HTMLButtonElement | null) => void;
    label: string;
    isChecked: boolean;
    isLit: boolean;
    isTabStop: boolean;
    disabled: boolean;
    onCommit: () => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
    onPreview: (isPreviewing: boolean) => void;
}

const STAR_ICON_SIZE = 24;

export const RatingStar: React.FC<RatingStarProps> = ({
    starRef,
    label,
    isChecked,
    isLit,
    isTabStop,
    disabled,
    onCommit,
    onKeyDown,
    onPreview,
}) => (
    <button
        ref={starRef}
        type="button"
        role="radio"
        aria-checked={isChecked}
        aria-label={label}
        tabIndex={isTabStop ? 0 : -1}
        disabled={disabled}
        className={cx(
            styles["star-rating-input__star"],
            isLit && styles["star-rating-input__star--on"],
        )}
        onClick={onCommit}
        onKeyDown={onKeyDown}
        onMouseEnter={() => {
            onPreview(true);
        }}
        onMouseLeave={() => {
            onPreview(false);
        }}
        onFocus={() => {
            onPreview(true);
        }}
        onBlur={() => {
            onPreview(false);
        }}
    >
        <Star size={STAR_ICON_SIZE} aria-hidden="true" />
    </button>
);
