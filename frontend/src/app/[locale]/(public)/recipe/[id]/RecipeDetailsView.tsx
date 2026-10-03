"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { changeRecipePath, ROUTES } from "constants/routes";
import type { RecipeDetails } from "types/recipe";

import { useIngredientAvailability } from "hooks/useIngredientAvailability";
import { usePortionScaling } from "hooks/usePortionScaling";
import { useRecipeDetailActions } from "hooks/useRecipeDetailActions";

import { AppShell } from "components/layout/AppShell";
import { RecipeDetailsSecondary } from "components/recipes/RecipeDetailsSecondary";
import { RecipeHero } from "components/recipes/RecipeHero";
import { Breadcrumb } from "components/ui/Breadcrumb";

import { getRecipeAllergens } from "utils/recipeAllergens";

import styles from "./RecipeDetailsView.module.scss";

interface RecipeDetailsViewProps {
    recipe: RecipeDetails;
}

// the recipe comes from the server render; only what depends on the viewer lives here
export const RecipeDetailsView: React.FC<RecipeDetailsViewProps> = ({
    recipe,
}) => {
    const { t } = useTranslation("recipes");
    const portions = usePortionScaling();
    const { availability, haveCount, missingCount } = useIngredientAvailability(
        recipe.ingredients,
    );
    const allergens = getRecipeAllergens(recipe.ingredients);
    const actions = useRecipeDetailActions(recipe, portions.count);

    return (
        <AppShell mobileBackTo={ROUTES.allRecipes}>
            <div className={styles["recipe-details-page"]}>
                <Breadcrumb
                    label={t("recipeDetailsPage.breadcrumb")}
                    parentHref={ROUTES.allRecipes}
                    parentLabel={t("recipeDetailsPage.breadcrumbRecipes")}
                    current={recipe.title}
                    desktopOnly
                />
                <div className={styles["recipe-details-page__grid"]}>
                    <div className={styles["recipe-details-page__hero-area"]}>
                        <RecipeHero
                            recipe={recipe}
                            portionCount={portions.count}
                            editTo={changeRecipePath(recipe.id)}
                            onDelete={actions.onDelete}
                            onLogIntake={actions.onLogIntake}
                            onCook={actions.onCook}
                            exceedsBudget={actions.exceedsBudget}
                        />
                    </div>
                    <RecipeDetailsSecondary
                        ingredientsAreaClassName={
                            styles["recipe-details-page__ingredients-area"]
                        }
                        descriptionAreaClassName={
                            styles["recipe-details-page__description-area"]
                        }
                        availability={availability}
                        haveCount={haveCount}
                        missingCount={missingCount}
                        isOwner={recipe.isOwner}
                        portionCount={portions.count}
                        onIncrement={portions.increment}
                        onDecrement={portions.decrement}
                        hasCustomCalories={recipe.calories_override !== null}
                        content={recipe.content}
                        language={recipe.language}
                        allergens={allergens}
                        recipeId={recipe.id}
                        tags={recipe.tags}
                    />
                </div>
            </div>
        </AppShell>
    );
};
