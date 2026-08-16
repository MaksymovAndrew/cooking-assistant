import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ROUTES } from "constants/routes";
import type { RecipeSearchResultItem } from "types/recipe";

import { RecentRecipeCard } from "components/home/RecentRecipes/RecentRecipeCard";
import { UtensilsMark } from "components/icons";
import { EmptyState } from "components/ui/EmptyState";
import { LinkButton } from "components/ui/LinkButton";

import { exceedsCalorieBudget } from "utils/calories";

import styles from "./RecentRecipes.module.scss";

interface RecentRecipesProps {
    recipes: RecipeSearchResultItem[];
    calorieGoal: number | null;
    calorieRemaining: number | null;
}

export const RecentRecipes: React.FC<RecentRecipesProps> = ({
    recipes,
    calorieGoal,
    calorieRemaining,
}) => {
    const { t } = useTranslation("home");

    return (
        <section className={styles["recent-recipes"]}>
            <div className={styles["recent-recipes__header"]}>
                <span className={styles["recent-recipes__title"]}>
                    {t("recentRecipes.title")}
                </span>
                <Link
                    to={ROUTES.myRecipes}
                    className={styles["recent-recipes__view-all"]}
                >
                    {t("recentRecipes.viewAll")}
                </Link>
            </div>
            {recipes.length > 0 ? (
                <div className={styles["recent-recipes__grid"]}>
                    {recipes.map((recipe) => (
                        <RecentRecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            exceedsBudget={exceedsCalorieBudget(
                                recipe.calories_per_portion,
                                calorieGoal,
                                calorieRemaining,
                            )}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={UtensilsMark}
                    title={t("recentRecipes.emptyTitle")}
                    description={t("recentRecipes.emptyDescription")}
                    action={
                        <LinkButton to={ROUTES.addRecipe}>
                            {t("recentRecipes.emptyAction")}
                        </LinkButton>
                    }
                />
            )}
        </section>
    );
};
