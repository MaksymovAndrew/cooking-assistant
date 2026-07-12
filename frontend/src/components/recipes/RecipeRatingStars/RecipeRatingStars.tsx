import { Star } from "lucide-react";
import React from "react";

import styles from "./RecipeRatingStars.module.scss";

interface RecipeRatingStarsProps {
    rating: string;
    ratingCount: string;
}

const STAR_INDICES = [0, 1, 2, 3, 4];
const STAR_ICON_SIZE = 18;
const FULL_STAR_PERCENT = 100;

const starFillPercent = (ratingValue: number, starIndex: number): number => {
    const fill = ratingValue - starIndex;

    if (fill <= 0) return 0;
    if (fill >= 1) return FULL_STAR_PERCENT;

    return fill * FULL_STAR_PERCENT;
};

export const RecipeRatingStars: React.FC<RecipeRatingStarsProps> = ({
    rating,
    ratingCount,
}) => {
    const ratingValue = Number(rating);

    return (
        <span className={styles["recipe-rating-stars"]}>
            <span className={styles["recipe-rating-stars__row"]}>
                {STAR_INDICES.map((starIndex) => (
                    <span
                        key={starIndex}
                        className={styles["recipe-rating-stars__star"]}
                    >
                        <Star
                            size={STAR_ICON_SIZE}
                            className={styles["recipe-rating-stars__outline"]}
                            aria-hidden="true"
                        />
                        <span
                            className={styles["recipe-rating-stars__fill"]}
                            style={{
                                width: `${starFillPercent(ratingValue, starIndex)}%`,
                            }}
                        >
                            <Star
                                size={STAR_ICON_SIZE}
                                className={
                                    styles["recipe-rating-stars__filled"]
                                }
                                aria-hidden="true"
                            />
                        </span>
                    </span>
                ))}
            </span>
            <span className={styles["recipe-rating-stars__value"]}>
                {rating}
            </span>
            <span className={styles["recipe-rating-stars__count"]}>
                {ratingCount}
            </span>
        </span>
    );
};
