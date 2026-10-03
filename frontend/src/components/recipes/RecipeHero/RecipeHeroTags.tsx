import React from "react";
import { useTranslation } from "react-i18next";

import type { RecordRating } from "types/rating";
import type { RecipeDetails } from "types/recipe";

import { Chip } from "components/ui/Chip";
import { LanguageBadge } from "components/ui/LanguageBadge";
import { RatingSummary } from "components/ui/RatingSummary";

import { recipeTypeName } from "utils/referenceLabels";

import styles from "./RecipeHero.module.scss";

interface RecipeHeroTagsProps {
    recipe: Pick<RecipeDetails, "type_name" | "language">;
    rating: RecordRating;
}

const RATING_ICON_SIZE = 13;

export const RecipeHeroTags: React.FC<RecipeHeroTagsProps> = ({
    recipe,
    rating,
}) => {
    const { t } = useTranslation("recipes");

    return (
        <div className={styles["recipe-hero__tags"]}>
            {recipe.type_name !== null && (
                <Chip variant="type">
                    {recipeTypeName(t, recipe.type_name)}
                </Chip>
            )}
            <LanguageBadge language={recipe.language} />
            <RatingSummary
                average={rating.ratingAverage}
                count={rating.ratingCount}
                iconSize={RATING_ICON_SIZE}
                className={styles["recipe-hero__rating-inline"]}
            />
        </div>
    );
};
