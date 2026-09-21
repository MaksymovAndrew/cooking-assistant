import { Star } from "lucide-react";
import React, { useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { RATING_VALUES } from "constants/ratings";

import type { RatingControl } from "hooks/useRatingControl";

import { starKeyTarget } from "./starKeyTarget";
import styles from "./StarRatingInput.module.scss";

interface StarRatingInputProps {
    rating: RatingControl;
    label: string;
    className?: string;
}

const STAR_ICON_SIZE = 24;

// arrows move focus and preview a value without sending anything; Enter, Space or a click commits,
// so browsing the stars by keyboard doesn't fire a request per keypress
export const StarRatingInput: React.FC<StarRatingInputProps> = ({
    rating,
    label,
    className,
}) => {
    const { t } = useTranslation("common");
    const labelId = useId();
    const { myRating: value, isDisabled: disabled } = rating;
    const clear = () => {
        rating.clear().catch(() => undefined);
    };
    const [preview, setPreview] = useState<number | null>(null);
    const starRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const shown = preview ?? value ?? 0;
    // one tab stop for the whole group, on the chosen star or the first
    const tabStop = value ?? 1;

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLButtonElement>,
        starValue: number,
    ) => {
        const target = starKeyTarget(event.key, starValue);

        if (target !== null) {
            event.preventDefault();
            starRefs.current[target - 1]?.focus();
        }
    };

    return (
        <div
            className={[styles["star-rating-input"], className]
                .filter(Boolean)
                .join(" ")}
        >
            <span id={labelId} className={styles["star-rating-input__label"]}>
                {label}
            </span>
            <div
                role="radiogroup"
                aria-labelledby={labelId}
                className={styles["star-rating-input__stars"]}
            >
                {RATING_VALUES.map((starValue) => (
                    <button
                        key={starValue}
                        ref={(element) => {
                            starRefs.current[starValue - 1] = element;
                        }}
                        type="button"
                        role="radio"
                        aria-checked={value === starValue}
                        aria-label={t("rating.star", { count: starValue })}
                        tabIndex={starValue === tabStop ? 0 : -1}
                        disabled={disabled}
                        className={[
                            styles["star-rating-input__star"],
                            starValue <= shown &&
                                styles["star-rating-input__star--on"],
                        ]
                            .filter(Boolean)
                            .join(" ")}
                        onClick={() => {
                            // pressing the chosen star again takes the vote back
                            if (starValue === value) {
                                clear();
                            } else {
                                rating.rate(starValue).catch(() => undefined);
                            }
                        }}
                        onKeyDown={(event) => {
                            handleKeyDown(event, starValue);
                        }}
                        onMouseEnter={() => {
                            setPreview(starValue);
                        }}
                        onMouseLeave={() => {
                            setPreview(null);
                        }}
                        onFocus={() => {
                            setPreview(starValue);
                        }}
                        onBlur={() => {
                            setPreview(null);
                        }}
                    >
                        <Star size={STAR_ICON_SIZE} aria-hidden="true" />
                    </button>
                ))}
            </div>
            {value !== null && (
                <button
                    type="button"
                    className={styles["star-rating-input__remove"]}
                    disabled={disabled}
                    onClick={clear}
                >
                    {t("rating.remove")}
                </button>
            )}
        </div>
    );
};
