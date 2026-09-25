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
import { Chip } from "components/ui/Chip";
import { StarRatingInput } from "components/ui/StarRatingInput";

import { mediaUrl } from "utils/mediaUrl";
import { recipeTypeName } from "utils/referenceLabels";

import styles from "./RecipeHero.module.scss";
import { RecipeHeroActions } from "./RecipeHeroActions";

interface RecipeHeroProps {
    recipe: RecipeDetails;
    portionCount: number;
    editTo: string;
    onDelete: () => void;
    onLogIntake?: () => void;
    exceedsBudget?: boolean;
}

export const RecipeHero: React.FC<RecipeHeroProps> = ({
    recipe,
    portionCount,
    editTo,
    onDelete,
    onLogIntake,
    exceedsBudget = false,
}) => {
    const { t } = useTranslation("recipes");
    const favourite = useFavouriteToggle(
        FAVOURITE_TARGET.recipe,
        recipe.id,
        recipe.isFavourite === true,
    );
    // isFavourite is null exactly when the server rendered this record for an anonymous requester -
    // deciding the guest branch from it, not from the client session check, keeps the first paint right
    const visitorFavourite = recipe.isFavourite === null ? null : favourite;
    const rating = useRatingControl(RATING_TARGET.recipe, recipe.id, recipe);
    // a signed-in viewer rates anyone's recipe but their own
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
                title={recipe.title}
                favourite={visitorFavourite}
                favouriteLabel={favouriteLabel}
            />

            <Chip variant="type" className={styles["recipe-hero__chip"]}>
                {recipe.type_name === null
                    ? null
                    : recipeTypeName(t, recipe.type_name)}
            </Chip>
            <h1 className={styles["recipe-hero__title"]}>{recipe.title}</h1>
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
                editTo={editTo}
                onDelete={onDelete}
                onLogIntake={onLogIntake}
            />
        </div>
    );
};
