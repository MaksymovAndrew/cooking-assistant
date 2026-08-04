import { skipToken } from "@reduxjs/toolkit/query";
import { ChevronRight } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { changeRecipePath, ROUTES } from "constants/routes";

import { useGetRecipeByIdQuery } from "redux/services/recipesApi";

import { useDeleteRecipeHandler } from "hooks/useDeleteRecipeHandler";
import { useExceedsCalorieBudget } from "hooks/useExceedsCalorieBudget";
import { useIngredientAvailability } from "hooks/useIngredientAvailability";
import { useLogIntakeHandler } from "hooks/useLogIntakeHandler";
import { usePortionScaling } from "hooks/usePortionScaling";

import { AppShell } from "components/layout/AppShell";
import { RecipeDetailsSecondary } from "components/recipes/RecipeDetailsSecondary";
import { RecipeHero } from "components/recipes/RecipeHero";
import { ErrorState } from "components/ui/ErrorState";

import { getRecipeAllergens } from "utils/recipeAllergens";

import styles from "./RecipeDetailsPage.module.scss";

const RecipeDetailsPage: React.FC = () => {
    const { t } = useTranslation("recipes");
    const { id } = useParams<{ id: string }>();
    const {
        data: recipe,
        isError,
        refetch,
    } = useGetRecipeByIdQuery(id ?? skipToken);

    const portions = usePortionScaling();
    const { availability, haveCount, missingCount } = useIngredientAvailability(
        recipe?.ingredients ?? [],
    );
    const allergens = getRecipeAllergens(recipe?.ingredients ?? []);
    const handleDeleteRecipe = useDeleteRecipeHandler(recipe);
    const handleLogIntake = useLogIntakeHandler({
        recipeId: recipe?.id,
        title: recipe?.title ?? "",
        caloriesPerPortion: recipe?.calories_per_portion ?? null,
        initialPortions: portions.count,
    });
    const exceedsBudget = useExceedsCalorieBudget(
        recipe?.calories_per_portion ?? null,
        portions.count,
    );

    if (isError) {
        return (
            <AppShell mobileBackTo={ROUTES.allRecipes}>
                <ErrorState
                    title={t("recipeDetailsPage.error", {
                        message: t("recipeDetailsPage.errorFetch"),
                    })}
                    onRetry={() => {
                        refetch().catch(() => undefined);
                    }}
                    retryLabel={t("common:errorState.retry")}
                />
            </AppShell>
        );
    }

    if (!recipe) {
        return (
            <AppShell mobileBackTo={ROUTES.allRecipes}>
                <p>{t("recipeDetailsPage.loading")}</p>
            </AppShell>
        );
    }

    return (
        <AppShell mobileBackTo={ROUTES.allRecipes}>
            <div className={styles["recipe-details-page"]}>
                <nav
                    aria-label={t("recipeDetailsPage.breadcrumb")}
                    className={styles["recipe-details-page__breadcrumb"]}
                >
                    <Link to={ROUTES.allRecipes}>
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
                        allergens={allergens}
                    />
                </div>
            </div>
        </AppShell>
    );
};

export default RecipeDetailsPage;
