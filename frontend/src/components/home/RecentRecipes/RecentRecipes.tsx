import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ROUTES } from "constants/routes";
import type { RecipeListItem } from "types/recipe";

import { RecentRecipeCard } from "components/home/RecentRecipes/RecentRecipeCard";

import styles from "./RecentRecipes.module.scss";

interface RecentRecipesProps {
    recipes: RecipeListItem[];
}

export const RecentRecipes: React.FC<RecentRecipesProps> = ({ recipes }) => {
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
                        <RecentRecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            ) : (
                <p className={styles["recent-recipes__empty"]}>
                    {t("recentRecipes.empty")}
                </p>
            )}
        </section>
    );
};
