"use client";

import { ChevronRight } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { changeRecipePath, ROUTES } from "constants/routes";
import type { RecipeDetails } from "types/recipe";

import { useDeleteRecipeHandler } from "hooks/useDeleteRecipeHandler";
import { useExceedsCalorieBudget } from "hooks/useExceedsCalorieBudget";
import { useIngredientAvailability } from "hooks/useIngredientAvailability";
import { useLogIntakeHandler } from "hooks/useLogIntakeHandler";
import { usePortionScaling } from "hooks/usePortionScaling";

import { AppShell } from "components/layout/AppShell";
import { RecipeDetailsSecondary } from "components/recipes/RecipeDetailsSecondary";
import { RecipeHero } from "components/recipes/RecipeHero";
import { Link } from "components/ui/Link";

import { getRecipeAllergens } from "utils/recipeAllergens";

import styles from "./RecipeDetailsView.module.scss";

interface RecipeDetailsViewProps {
    recipe: RecipeDetails;
}

// the recipe itself arrives from the server render; only what depends on the viewer's own
// browser - their pantry, their calorie budget, the portion stepper - is fetched here
export const RecipeDetailsView: React.FC<RecipeDetailsViewProps> = ({
    recipe,
}) => {
    const { t } = useTranslation("recipes");
    const portions = usePortionScaling();
    const { availability, haveCount, missingCount } = useIngredientAvailability(
        recipe.ingredients,
    );
    const allergens = getRecipeAllergens(recipe.ingredients);
    const handleDeleteRecipe = useDeleteRecipeHandler(recipe);
    const handleLogIntake = useLogIntakeHandler({
        recipeId: recipe.id,
        title: recipe.title,
        caloriesPerPortion: recipe.calories_per_portion,
        initialPortions: portions.count,
    });
    const exceedsBudget = useExceedsCalorieBudget(
        recipe.calories_per_portion,
        portions.count,
    );

    return (
        <AppShell mobileBackTo={ROUTES.allRecipes}>
            <div className={styles["recipe-details-page"]}>
                <nav
                    aria-label={t("recipeDetailsPage.breadcrumb")}
                    className={styles["recipe-details-page__breadcrumb"]}
                >
                    <Link href={ROUTES.allRecipes}>
                        {t("recipeDetailsPage.breadcrumbRecipes")}
                    </Link>
                    <ChevronRight size={14} aria-hidden="true" />
                    <span>{recipe.title}</span>
                </nav>
                <div className={styles["recipe-details-page__grid"]}>
                    <div className={styles["recipe-details-page__hero-area"]}>
                        <RecipeHero
                            recipe={recipe}
                            portionCount={portions.count}
                            editTo={changeRecipePath(recipe.id)}
                            onDelete={handleDeleteRecipe}
                            onLogIntake={handleLogIntake}
                            exceedsBudget={exceedsBudget}
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
