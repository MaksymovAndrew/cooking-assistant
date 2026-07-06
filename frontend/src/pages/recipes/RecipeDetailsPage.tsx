import { skipToken } from "@reduxjs/toolkit/query";
import { ChevronRight } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { changeRecipePath, ROUTES } from "constants/routes";

import { useAppDispatch } from "redux/hooks";
import { useGetRecipeByIdQuery } from "redux/services/recipesApi";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

import { useIngredientAvailability } from "hooks/useIngredientAvailability";
import { useServingsScaling } from "hooks/useServingsScaling";

import { AppShell } from "components/layout/AppShell";
import { RecipeHero } from "components/recipes/RecipeHero";
import { RecipeIngredientsPanel } from "components/recipes/RecipeIngredientsPanel";
import { ErrorState } from "components/ui/ErrorState";

import styles from "./RecipeDetailsPage.module.scss";

const RecipeDetailsPage: React.FC = () => {
    const { t } = useTranslation("recipes");
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const {
        data: recipe,
        isError,
        refetch,
    } = useGetRecipeByIdQuery(id ?? skipToken);

    const servings = useServingsScaling(recipe?.servings ?? null);
    const { availability, haveCount, missingCount } = useIngredientAvailability(
        recipe?.ingredients ?? [],
    );

    if (isError) {
        return (
            <AppShell>
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
            <AppShell>
                <p>{t("recipeDetailsPage.loading")}</p>
            </AppShell>
        );
    }

    return (
        <AppShell>
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
                    <RecipeHero
                        recipe={recipe}
                        servingsDisplay={servings.displayValue}
                        editTo={changeRecipePath(recipe.id)}
                        onDelete={() => {
                            dispatch(
                                openModal({
                                    type: MODAL_TYPE.deleteRecipe,
                                    recipeId: String(recipe.id),
                                }),
                            );
                        }}
                    />
                    <RecipeIngredientsPanel
                        availability={availability}
                        haveCount={haveCount}
                        missingCount={missingCount}
                        canScale={servings.canScale}
                        servingsCount={servings.current}
                        scaleFactor={servings.scaleFactor}
                        onIncrement={servings.increment}
                        onDecrement={servings.decrement}
                    />
                </div>
            </div>
        </AppShell>
    );
};

export default RecipeDetailsPage;
