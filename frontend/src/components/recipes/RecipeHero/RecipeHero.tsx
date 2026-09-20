import React from "react";
import { useTranslation } from "react-i18next";

import { FAVOURITE_TARGET } from "constants/favourites";
import type { RecipeDetails } from "types/recipe";

import { useFavouriteToggle } from "hooks/useFavouriteToggle";
import { useRecipeHeroLabels } from "hooks/useRecipeHeroLabels";

import { UtensilsMarkSimple } from "components/icons";
import { RecipeHeroStats } from "components/recipes/RecipeHero/RecipeHeroStats";
import { Chip } from "components/ui/Chip";
import { FavouriteButton } from "components/ui/FavouriteButton";
import { HeroVisitorActions } from "components/ui/HeroVisitorActions";
import { OwnerActions } from "components/ui/OwnerActions";

import styles from "./RecipeHero.module.scss";

interface RecipeHeroProps {
    recipe: RecipeDetails;
    portionCount: number;
    editTo: string;
    onDelete: () => void;
    onLogIntake?: () => void;
    exceedsBudget?: boolean;
}

const IMAGE_ICON_SIZE = 56;
const FAVOURITE_ICON_SIZE = 20;

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
    const favouriteLabel = t("recipeDetailsPage.favourite");
    const {
        formattedCookingTime,
        formattedCalories,
        totalCalories,
        formattedDate,
    } = useRecipeHeroLabels(recipe, portionCount);

    return (
        <div className={styles["recipe-hero"]}>
            <div className={styles["recipe-hero__image"]}>
                <UtensilsMarkSimple
                    size={IMAGE_ICON_SIZE}
                    className={styles["recipe-hero__image-icon"]}
                />
                {visitorFavourite && (
                    <FavouriteButton
                        favourite={visitorFavourite}
                        label={favouriteLabel}
                        iconSize={FAVOURITE_ICON_SIZE}
                        className={styles["recipe-hero__favourite"]}
                    />
                )}
            </div>

            <Chip variant="type" className={styles["recipe-hero__chip"]}>
                {recipe.type_name}
            </Chip>
            <h1 className={styles["recipe-hero__title"]}>{recipe.title}</h1>

            <RecipeHeroStats
                formattedCookingTime={formattedCookingTime}
                formattedCalories={formattedCalories}
                totalCalories={totalCalories}
                formattedDate={formattedDate}
                isOwner={recipe.isOwner}
                exceedsBudget={exceedsBudget}
            />

            {recipe.isOwner ? (
                <div className={styles["recipe-hero__actions"]}>
                    <OwnerActions
                        editTo={editTo}
                        onDelete={onDelete}
                        editLabel={t("recipeDetailsPage.editButton")}
                        deleteLabel={t("recipeDetailsPage.deleteButton")}
                        favourite={favourite}
                        favouriteLabel={favouriteLabel}
                        onLogIntake={onLogIntake}
                        logIntakeLabel={t("recipeDetailsPage.logIntake")}
                    />
                </div>
            ) : (
                <div className={styles["recipe-hero__visitor-actions-wrap"]}>
                    <HeroVisitorActions
                        favourite={visitorFavourite}
                        favouriteLabel={favouriteLabel}
                        guestCtaLabel={t("recipeDetailsPage.guestCta")}
                        logIntakeLabel={t("recipeDetailsPage.logIntake")}
                        onLogIntake={onLogIntake}
                    />
                </div>
            )}
        </div>
    );
};
