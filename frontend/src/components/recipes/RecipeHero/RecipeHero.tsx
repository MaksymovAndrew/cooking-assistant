import { Calendar, Clock, Heart } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeDetails } from "types/recipe";

import { PortionsMark, UtensilsMarkSimple } from "components/icons";
import { Chip } from "components/ui/Chip";
import { OwnerActions } from "components/ui/OwnerActions";

import { splitCookingTime } from "utils/cookingTimeUtils";
import { formatDate } from "utils/dateUtils";

import styles from "./RecipeHero.module.scss";

interface RecipeHeroProps {
    recipe: RecipeDetails;
    servingsDisplay: string;
    editTo: string;
    onDelete: () => void;
}

const IMAGE_ICON_SIZE = 56;
const FAVOURITE_ICON_SIZE = 20;
const STAT_ICON_SIZE = 16;

export const RecipeHero: React.FC<RecipeHeroProps> = ({
    recipe,
    servingsDisplay,
    editTo,
    onDelete,
}) => {
    const { t, i18n } = useTranslation("recipes");
    const { hours, minutes } = splitCookingTime(recipe.cooking_time);
    const formattedCookingTime =
        hours > 0
            ? t("recipeDetailsPage.cookingTimeHoursMinutes", {
                  hours,
                  minutes,
              })
            : t("recipeDetailsPage.cookingTimeMinutes", { minutes });
    const formattedDate = formatDate(recipe.creation_date, i18n.language);

    return (
        <div className={styles["recipe-hero"]}>
            <div className={styles["recipe-hero__image"]}>
                <UtensilsMarkSimple
                    size={IMAGE_ICON_SIZE}
                    className={styles["recipe-hero__image-icon"]}
                />
                <button
                    type="button"
                    disabled
                    aria-label={t("recipeDetailsPage.favourite")}
                    className={styles["recipe-hero__favourite"]}
                >
                    <Heart size={FAVOURITE_ICON_SIZE} aria-hidden="true" />
                </button>
            </div>

            <Chip variant="type" className={styles["recipe-hero__chip"]}>
                {recipe.type_name}
            </Chip>
            <h1 className={styles["recipe-hero__title"]}>{recipe.title}</h1>

            <div className={styles["recipe-hero__stats"]}>
                <div className={styles["recipe-hero__stat"]}>
                    <span className={styles["recipe-hero__stat-label"]}>
                        {t("recipeDetailsPage.cookingTime")}
                    </span>
                    <span className={styles["recipe-hero__stat-value"]}>
                        <Clock size={STAT_ICON_SIZE} aria-hidden="true" />
                        {formattedCookingTime}
                    </span>
                </div>
                <div className={styles["recipe-hero__stat"]}>
                    <span className={styles["recipe-hero__stat-label"]}>
                        {t("recipeDetailsPage.servings")}
                    </span>
                    <span className={styles["recipe-hero__stat-value"]}>
                        <PortionsMark size={STAT_ICON_SIZE} />
                        {servingsDisplay}
                    </span>
                </div>
                <div className={styles["recipe-hero__stat"]}>
                    <span className={styles["recipe-hero__stat-label"]}>
                        {t("recipeDetailsPage.creationDate")}
                    </span>
                    <span className={styles["recipe-hero__stat-value"]}>
                        <Calendar size={STAT_ICON_SIZE} aria-hidden="true" />
                        {formattedDate}
                    </span>
                </div>
            </div>

            {recipe.isOwner && (
                <div className={styles["recipe-hero__actions"]}>
                    <OwnerActions
                        editTo={editTo}
                        onDelete={onDelete}
                        editLabel={t("recipeDetailsPage.editButton")}
                        deleteLabel={t("recipeDetailsPage.deleteButton")}
                    />
                </div>
            )}

            <span className={styles["recipe-hero__description-label"]}>
                {t("recipeDetailsPage.description")}
            </span>
            <p className={styles["recipe-hero__description"]}>
                {recipe.content}
            </p>
        </div>
    );
};
