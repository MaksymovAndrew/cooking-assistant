import React from "react";
import { useTranslation } from "react-i18next";

import { FAVOURITE_TARGET } from "constants/favourites";
import { RATING_TARGET } from "constants/ratings";
import type { RecipeDetails } from "types/recipe";

import { useFavouriteToggle } from "hooks/useFavouriteToggle";
import { useRatingControl } from "hooks/useRatingControl";
import { useRecipeHeroLabels } from "hooks/useRecipeHeroLabels";

import { RecipeHeroImage } from "components/recipes/RecipeHero/RecipeHeroImage";
import { RecipeHeroStats } from "components/recipes/RecipeHero/RecipeHeroStats";
import { AuthorByline } from "components/ui/AuthorByline";
import { StarRatingInput } from "components/ui/StarRatingInput";

import { mediaSrcSet, mediaUrl } from "utils/mediaUrl";

import styles from "./RecipeHero.module.scss";
import { RecipeHeroActions } from "./RecipeHeroActions";
import { RecipeHeroTags } from "./RecipeHeroTags";

interface RecipeHeroProps {
    recipe: RecipeDetails;
    portionCount: number;
    editTo: string;
    onDelete: () => void;
    onLogIntake?: () => void;
    onCook?: () => void;
    exceedsBudget?: boolean;
}

export const RecipeHero: React.FC<RecipeHeroProps> = ({
    recipe,
    portionCount,
    editTo,
    onDelete,
    onLogIntake,
    onCook,
    exceedsBudget = false,
}) => {
    const { t } = useTranslation("recipes");
    const favourite = useFavouriteToggle(
        FAVOURITE_TARGET.recipe,
        recipe.id,
        recipe.isFavourite === true,
    );
    // null isFavourite means a guest render; the session check isn't done on first paint
    const visitorFavourite = recipe.isFavourite === null ? null : favourite;
    const rating = useRatingControl(RATING_TARGET.recipe, recipe.id, recipe);
    const canRate = visitorFavourite !== null && !recipe.isOwner;
    const photoSrc = mediaUrl(recipe.photo_key, "hero");
    const favouriteLabel = t("recipeDetailsPage.favourite");
    const {
        formattedCookingTime,
        formattedCalories,
        totalCalories,
        formattedDate,
    } = useRecipeHeroLabels(recipe, portionCount);

    return (
        <div className={styles["recipe-hero"]}>
            <RecipeHeroImage
                photoSrc={photoSrc}
                photoSrcSet={mediaSrcSet(recipe.photo_key)}
                title={recipe.title}
                favourite={visitorFavourite}
                favouriteLabel={favouriteLabel}
            />

            <RecipeHeroTags recipe={recipe} rating={rating} />
            <h1 className={styles["recipe-hero__title"]} lang={recipe.language}>
                {recipe.title}
            </h1>
            <AuthorByline
                author={recipe.author}
                className={styles["recipe-hero__author"]}
            />

            <RecipeHeroStats
                formattedCookingTime={formattedCookingTime}
                formattedCalories={formattedCalories}
                totalCalories={totalCalories}
                formattedDate={formattedDate}
                rating={rating}
                exceedsBudget={exceedsBudget}
            />

            {canRate && (
                <StarRatingInput
                    rating={rating}
                    label={t("common:rating.yourRating")}
                    className={styles["recipe-hero__rate"]}
                />
            )}

            <RecipeHeroActions
                isOwner={recipe.isOwner}
                favourite={favourite}
                visitorFavourite={visitorFavourite}
                favouriteLabel={favouriteLabel}
                shareTitle={recipe.title}
                editTo={editTo}
                onDelete={onDelete}
                onLogIntake={onLogIntake}
                onCook={onCook}
            />
        </div>
    );
};
